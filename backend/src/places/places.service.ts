import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Place } from './entities/place.entity';
import { PlaceImage } from './entities/place-image.entity';
import { Like } from '../social/entities/like.entity';
import { Bookmark } from '../bookmarks/entities/bookmark.entity';
import { BookmarkCollection } from '../bookmarks/entities/bookmark-collection.entity';
import { User } from '../users/entities/user.entity';
import { PushNotificationService } from '../notifications/push-notification.service';
import { CreatePlaceDto } from './dto/create-place.dto';
import { QueryPlaceDto } from './dto/query-place.dto';

@Injectable()
export class PlacesService {
  constructor(
    @InjectRepository(Place)
    private placesRepository: Repository<Place>,
    @InjectRepository(PlaceImage)
    private placeImagesRepository: Repository<PlaceImage>,
    @InjectRepository(Like)
    private likesRepository: Repository<Like>,
    @InjectRepository(Bookmark)
    private bookmarksRepository: Repository<Bookmark>,
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    private pushNotificationService: PushNotificationService,
  ) {}

  async create(
    userId: string,
    createPlaceDto: CreatePlaceDto,
    imageUrls: string[] = [],
  ) {
    const place = this.placesRepository.create({
      ...createPlaceDto,
      user_id: userId,
    });

    const savedPlace = await this.placesRepository.save(place);

    // Update PostGIS location column
    if (savedPlace.latitude && savedPlace.longitude) {
      await this.placesRepository
        .createQueryBuilder()
        .update(Place)
        .set({
          location: () =>
            `ST_SetSRID(ST_MakePoint(${savedPlace.longitude}, ${savedPlace.latitude}), 4326)`,
        })
        .where('id = :id', { id: savedPlace.id })
        .execute();
    }

    // Save images
    if (imageUrls.length > 0) {
      const images = imageUrls.map((url, index) =>
        this.placeImagesRepository.create({
          place_id: savedPlace.id,
          url,
          order_idx: index,
        }),
      );
      await this.placeImagesRepository.save(images);
    }

    return this.findById(savedPlace.id);
  }

  async findAll(query: QueryPlaceDto) {
    const {
      lat,
      lng,
      radius = 10,
      category,
      page = 1,
      limit = 20,
      sort = 'latest',
    } = query;

    const queryBuilder = this.placesRepository
      .createQueryBuilder('place')
      .leftJoinAndSelect('place.images', 'images')
      .leftJoinAndSelect('place.user', 'user')
      .where('place.is_published = :published', { published: true });

    // Category filter
    if (category) {
      queryBuilder.andWhere('place.category = :category', { category });
    }

    // Geo filter using simple distance calculation (Haversine approximation)
    if (lat && lng) {
      queryBuilder.addSelect(
        `(6371 * acos(cos(radians(:lat)) * cos(radians(place.latitude)) * cos(radians(place.longitude) - radians(:lng)) + sin(radians(:lat)) * sin(radians(place.latitude))))`,
        'distance',
      );
      queryBuilder.setParameter('lat', lat);
      queryBuilder.setParameter('lng', lng);
      queryBuilder.having('distance <= :radius', { radius });
    }

    // Sorting
    switch (sort) {
      case 'popular':
        queryBuilder.orderBy('place.like_count', 'DESC');
        break;
      case 'nearest':
        if (lat && lng) {
          queryBuilder.orderBy('distance', 'ASC');
        }
        break;
      case 'latest':
      default:
        queryBuilder.orderBy('place.created_at', 'DESC');
    }

    // Pagination
    const skip = (page - 1) * limit;
    queryBuilder.skip(skip).take(limit);

    const [places, total] = await queryBuilder.getManyAndCount();

    return {
      data: places.map((place) => ({
        ...place,
        user: place.user
          ? {
              id: place.user.id,
              username: place.user.username,
              avatar_url: place.user.avatar_url,
            }
          : null,
      })),
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasMore: page * limit < total,
      },
    };
  }

  async findById(id: string, currentUserId?: string) {
    const place = await this.placesRepository.findOne({
      where: { id },
      relations: ['images', 'user'],
    });

    if (!place) {
      throw new NotFoundException('Không tìm thấy địa điểm');
    }

    let isLiked = false;
    let isBookmarked = false;

    if (currentUserId) {
      const [like, bookmark] = await Promise.all([
        this.likesRepository.findOne({
          where: { user_id: currentUserId, place_id: id },
        }),
        this.bookmarksRepository.findOne({
          where: { place_id: id },
        }),
      ]);
      isLiked = !!like;
      isBookmarked = !!bookmark;
    }

    return {
      ...place,
      user: place.user
        ? {
            id: place.user.id,
            username: place.user.username,
            avatar_url: place.user.avatar_url,
          }
        : null,
      is_liked: isLiked,
      is_bookmarked: isBookmarked,
    };
  }

  async findNearby(
    lat: number,
    lng: number,
    radius: number = 5,
    limit: number = 20,
  ) {
    return this.findAll({ lat, lng, radius, sort: 'nearest', limit, page: 1 });
  }

  async toggleLike(userId: string, placeId: string) {
    const place = await this.placesRepository.findOne({
      where: { id: placeId },
      relations: ['user'],
    });
    if (!place) {
      throw new NotFoundException('Không tìm thấy địa điểm');
    }

    const existingLike = await this.likesRepository.findOne({
      where: { user_id: userId, place_id: placeId },
    });

    if (existingLike) {
      await this.likesRepository.remove(existingLike);
      await this.placesRepository.decrement({ id: placeId }, 'like_count', 1);
      return { liked: false, like_count: place.like_count - 1 };
    }

    const like = this.likesRepository.create({
      user_id: userId,
      place_id: placeId,
    });
    await this.likesRepository.save(like);
    await this.placesRepository.increment({ id: placeId }, 'like_count', 1);

    // Send push notification to place owner if they have a device token
    if (place.user && place.user.id !== userId) {
      const owner = await this.usersRepository.findOne({
        where: { id: place.user.id },
      });

      if (owner?.device_token && owner.push_notifications_enabled) {
        await this.pushNotificationService.notifyNewLike(
          place.user.id,
          place.title,
          placeId,
        );
      }
    }

    return { liked: true, like_count: place.like_count + 1 };
  }

  async deletePlace(placeId: string, userId: string) {
    const place = await this.placesRepository.findOne({
      where: { id: placeId, user_id: userId },
    });

    if (!place) {
      throw new NotFoundException(
        'Không tìm thấy địa điểm hoặc không có quyền xóa',
      );
    }

    await this.placesRepository.remove(place);
    return { message: 'Đã xóa địa điểm' };
  }

  async toggleBookmark(userId: string, placeId: string) {
    const place = await this.placesRepository.findOne({
      where: { id: placeId },
    });
    if (!place) {
      throw new NotFoundException('Không tìm thấy địa điểm');
    }

    // Find any bookmark of this place by this user
    const existingBookmark = await this.bookmarksRepository.findOne({
      where: { place_id: placeId },
      relations: ['collection'],
    });

    if (existingBookmark && existingBookmark.collection?.user_id === userId) {
      await this.bookmarksRepository.remove(existingBookmark);
      await this.placesRepository.decrement(
        { id: placeId },
        'bookmark_count',
        1,
      );
      return { bookmarked: false, bookmark_count: place.bookmark_count - 1 };
    }

    // Auto-create default collection if needed
    const collectionRepo =
      this.bookmarksRepository.manager.getRepository(BookmarkCollection);
    let defaultCollection = await collectionRepo.findOne({
      where: { user_id: userId, name: 'Yêu thích' },
    });

    if (!defaultCollection) {
      defaultCollection = collectionRepo.create({
        user_id: userId,
        name: 'Yêu thích',
        is_public: false,
      });
      await collectionRepo.save(defaultCollection);
    }

    const bookmark = this.bookmarksRepository.create({
      collection_id: defaultCollection.id,
      place_id: placeId,
    });
    await this.bookmarksRepository.save(bookmark);
    await this.placesRepository.increment({ id: placeId }, 'bookmark_count', 1);

    return { bookmarked: true, bookmark_count: place.bookmark_count + 1 };
  }

  async getUserPlaces(userId: string, page: number = 1, limit: number = 20) {
    const [places, total] = await this.placesRepository.findAndCount({
      where: { user_id: userId },
      relations: ['images'],
      order: { created_at: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    return {
      data: places,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasMore: page * limit < total,
      },
    };
  }
}
