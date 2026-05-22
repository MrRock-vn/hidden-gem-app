"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PlacesService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const place_entity_1 = require("./entities/place.entity");
const place_image_entity_1 = require("./entities/place-image.entity");
const like_entity_1 = require("../social/entities/like.entity");
const bookmark_entity_1 = require("../bookmarks/entities/bookmark.entity");
const bookmark_collection_entity_1 = require("../bookmarks/entities/bookmark-collection.entity");
const user_entity_1 = require("../users/entities/user.entity");
const push_notification_service_1 = require("../notifications/push-notification.service");
let PlacesService = class PlacesService {
    placesRepository;
    placeImagesRepository;
    likesRepository;
    bookmarksRepository;
    usersRepository;
    pushNotificationService;
    constructor(placesRepository, placeImagesRepository, likesRepository, bookmarksRepository, usersRepository, pushNotificationService) {
        this.placesRepository = placesRepository;
        this.placeImagesRepository = placeImagesRepository;
        this.likesRepository = likesRepository;
        this.bookmarksRepository = bookmarksRepository;
        this.usersRepository = usersRepository;
        this.pushNotificationService = pushNotificationService;
    }
    async create(userId, createPlaceDto, imageUrls = []) {
        const place = this.placesRepository.create({
            ...createPlaceDto,
            user_id: userId,
        });
        const savedPlace = await this.placesRepository.save(place);
        if (savedPlace.latitude && savedPlace.longitude) {
            await this.placesRepository
                .createQueryBuilder()
                .update(place_entity_1.Place)
                .set({
                location: () => `ST_SetSRID(ST_MakePoint(:lng, :lat), 4326)`,
            })
                .setParameter('lng', savedPlace.longitude)
                .setParameter('lat', savedPlace.latitude)
                .where('id = :id', { id: savedPlace.id })
                .execute();
        }
        if (imageUrls.length > 0) {
            const images = imageUrls.map((url, index) => this.placeImagesRepository.create({
                place_id: savedPlace.id,
                url,
                order_idx: index,
            }));
            await this.placeImagesRepository.save(images);
        }
        return this.findById(savedPlace.id);
    }
    async findAll(query, currentUserId) {
        const { lat, lng, radius = 10, category, page = 1, limit = 20, sort = 'latest', } = query;
        const queryBuilder = this.placesRepository
            .createQueryBuilder('place')
            .leftJoinAndSelect('place.images', 'images')
            .leftJoinAndSelect('place.user', 'user')
            .where('place.is_published = :published', { published: true });
        if (category) {
            queryBuilder.andWhere('place.category = :category', { category });
        }
        if (lat && lng) {
            queryBuilder.addSelect(`(6371 * acos(cos(radians(:lat)) * cos(radians(place.latitude)) * cos(radians(place.longitude) - radians(:lng)) + sin(radians(:lat)) * sin(radians(place.latitude))))`, 'distance');
            queryBuilder.setParameter('lat', lat);
            queryBuilder.setParameter('lng', lng);
            queryBuilder.andWhere(`(6371 * acos(cos(radians(:filterLat)) * cos(radians(place.latitude)) * cos(radians(place.longitude) - radians(:filterLng)) + sin(radians(:filterLat)) * sin(radians(place.latitude)))) <= :radius`, { filterLat: lat, filterLng: lng, radius });
        }
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
        const skip = (page - 1) * limit;
        queryBuilder.skip(skip).take(limit);
        const [places, total] = await queryBuilder.getManyAndCount();
        const likedPlaceIds = new Set();
        const bookmarkedPlaceIds = new Set();
        const placeIds = places.map((place) => place.id);
        if (currentUserId && placeIds.length > 0) {
            const [likes, bookmarks] = await Promise.all([
                this.likesRepository.find({
                    where: { user_id: currentUserId, place_id: (0, typeorm_2.In)(placeIds) },
                    select: ['place_id'],
                }),
                this.bookmarksRepository
                    .createQueryBuilder('bookmark')
                    .select('bookmark.place_id', 'place_id')
                    .innerJoin('bookmark.collection', 'collection')
                    .where('bookmark.place_id IN (:...placeIds)', { placeIds })
                    .andWhere('collection.user_id = :userId', { userId: currentUserId })
                    .getRawMany(),
            ]);
            likes.forEach((like) => likedPlaceIds.add(like.place_id));
            bookmarks.forEach((bookmark) => bookmarkedPlaceIds.add(bookmark.place_id));
        }
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
                is_liked: likedPlaceIds.has(place.id),
                is_bookmarked: bookmarkedPlaceIds.has(place.id),
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
    async findById(id, currentUserId) {
        const place = await this.placesRepository.findOne({
            where: { id },
            relations: ['images', 'user'],
        });
        if (!place) {
            throw new common_1.NotFoundException('Không tìm thấy địa điểm');
        }
        let isLiked = false;
        let isBookmarked = false;
        if (currentUserId) {
            const [like, bookmark] = await Promise.all([
                this.likesRepository.findOne({
                    where: { user_id: currentUserId, place_id: id },
                }),
                this.bookmarksRepository
                    .createQueryBuilder('bookmark')
                    .innerJoin('bookmark.collection', 'collection')
                    .where('bookmark.place_id = :placeId', { placeId: id })
                    .andWhere('collection.user_id = :userId', { userId: currentUserId })
                    .getOne(),
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
    async findNearby(lat, lng, radius = 5, limit = 20, currentUserId) {
        return this.findAll({ lat, lng, radius, sort: 'nearest', limit, page: 1 }, currentUserId);
    }
    async toggleLike(userId, placeId) {
        const place = await this.placesRepository.findOne({
            where: { id: placeId },
            relations: ['user'],
        });
        if (!place) {
            throw new common_1.NotFoundException('Không tìm thấy địa điểm');
        }
        const existingLike = await this.likesRepository.findOne({
            where: { user_id: userId, place_id: placeId },
        });
        if (existingLike) {
            await this.likesRepository.remove(existingLike);
            await this.placesRepository
                .createQueryBuilder()
                .update(place_entity_1.Place)
                .set({ like_count: () => 'GREATEST(like_count - 1, 0)' })
                .where('id = :id', { id: placeId })
                .execute();
            return { liked: false, like_count: Math.max(place.like_count - 1, 0) };
        }
        const like = this.likesRepository.create({
            user_id: userId,
            place_id: placeId,
        });
        await this.likesRepository.save(like);
        await this.placesRepository.increment({ id: placeId }, 'like_count', 1);
        if (place.user && place.user.id !== userId) {
            const owner = await this.usersRepository.findOne({
                where: { id: place.user.id },
            });
            if (owner?.device_token && owner.push_notifications_enabled) {
                await this.pushNotificationService.notifyNewLike(place.user.id, place.title, placeId);
            }
        }
        return { liked: true, like_count: place.like_count + 1 };
    }
    async deletePlace(placeId, userId) {
        const place = await this.placesRepository.findOne({
            where: { id: placeId, user_id: userId },
        });
        if (!place) {
            throw new common_1.NotFoundException('Không tìm thấy địa điểm hoặc không có quyền xóa');
        }
        await this.placesRepository.remove(place);
        return { message: 'Đã xóa địa điểm' };
    }
    async toggleBookmark(userId, placeId) {
        const place = await this.placesRepository.findOne({
            where: { id: placeId },
        });
        if (!place) {
            throw new common_1.NotFoundException('Không tìm thấy địa điểm');
        }
        const existingBookmark = await this.bookmarksRepository
            .createQueryBuilder('bookmark')
            .innerJoinAndSelect('bookmark.collection', 'collection')
            .where('bookmark.place_id = :placeId', { placeId })
            .andWhere('collection.user_id = :userId', { userId })
            .getOne();
        if (existingBookmark) {
            await this.bookmarksRepository.remove(existingBookmark);
            await this.placesRepository
                .createQueryBuilder()
                .update(place_entity_1.Place)
                .set({ bookmark_count: () => 'GREATEST(bookmark_count - 1, 0)' })
                .where('id = :id', { id: placeId })
                .execute();
            return { bookmarked: false, bookmark_count: Math.max(0, place.bookmark_count - 1) };
        }
        const collectionRepo = this.bookmarksRepository.manager.getRepository(bookmark_collection_entity_1.BookmarkCollection);
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
    async getUserPlaces(userId, page = 1, limit = 20) {
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
};
exports.PlacesService = PlacesService;
exports.PlacesService = PlacesService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(place_entity_1.Place)),
    __param(1, (0, typeorm_1.InjectRepository)(place_image_entity_1.PlaceImage)),
    __param(2, (0, typeorm_1.InjectRepository)(like_entity_1.Like)),
    __param(3, (0, typeorm_1.InjectRepository)(bookmark_entity_1.Bookmark)),
    __param(4, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        push_notification_service_1.PushNotificationService])
], PlacesService);
//# sourceMappingURL=places.service.js.map