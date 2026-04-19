import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BookmarkCollection } from './entities/bookmark-collection.entity';
import { Bookmark } from './entities/bookmark.entity';
import { Place } from '../places/entities/place.entity';

@Injectable()
export class BookmarksService {
  constructor(
    @InjectRepository(BookmarkCollection)
    private collectionsRepository: Repository<BookmarkCollection>,
    @InjectRepository(Bookmark)
    private bookmarksRepository: Repository<Bookmark>,
    @InjectRepository(Place)
    private placesRepository: Repository<Place>,
  ) {}

  async getUserCollections(userId: string) {
    const collections = await this.collectionsRepository.find({
      where: { user_id: userId },
      relations: ['bookmarks', 'bookmarks.place', 'bookmarks.place.images'],
      order: { created_at: 'DESC' },
    });

    return collections.map((c) => ({
      ...c,
      place_count: c.bookmarks?.length || 0,
      preview_images: c.bookmarks
        ?.slice(0, 4)
        .map((b) => b.place?.images?.[0]?.url)
        .filter(Boolean),
    }));
  }

  async createCollection(userId: string, name: string, isPublic: boolean = false) {
    const collection = this.collectionsRepository.create({
      user_id: userId,
      name,
      is_public: isPublic,
    });
    return this.collectionsRepository.save(collection);
  }

  async addPlaceToCollection(collectionId: string, placeId: string, userId: string) {
    const collection = await this.collectionsRepository.findOne({
      where: { id: collectionId, user_id: userId },
    });
    if (!collection) throw new NotFoundException('Không tìm thấy bộ sưu tập');

    const place = await this.placesRepository.findOne({ where: { id: placeId } });
    if (!place) throw new NotFoundException('Không tìm thấy địa điểm');

    const existing = await this.bookmarksRepository.findOne({
      where: { collection_id: collectionId, place_id: placeId },
    });
    if (existing) return { message: 'Đã có trong bộ sưu tập' };

    const bookmark = this.bookmarksRepository.create({
      collection_id: collectionId,
      place_id: placeId,
    });
    await this.bookmarksRepository.save(bookmark);
    await this.placesRepository.increment({ id: placeId }, 'bookmark_count', 1);
    return { message: 'Đã thêm vào bộ sưu tập' };
  }

  async removePlaceFromCollection(collectionId: string, placeId: string, userId: string) {
    const collection = await this.collectionsRepository.findOne({
      where: { id: collectionId, user_id: userId },
    });
    if (!collection) throw new NotFoundException('Không tìm thấy bộ sưu tập');

    const bookmark = await this.bookmarksRepository.findOne({
      where: { collection_id: collectionId, place_id: placeId },
    });
    if (!bookmark) throw new NotFoundException('Địa điểm không có trong bộ sưu tập');

    await this.bookmarksRepository.remove(bookmark);
    await this.placesRepository.decrement({ id: placeId }, 'bookmark_count', 1);
    return { message: 'Đã xóa khỏi bộ sưu tập' };
  }

  async deleteCollection(collectionId: string, userId: string) {
    const collection = await this.collectionsRepository.findOne({
      where: { id: collectionId, user_id: userId },
    });
    if (!collection) throw new NotFoundException('Không tìm thấy bộ sưu tập');

    await this.collectionsRepository.remove(collection);
    return { message: 'Đã xóa bộ sưu tập' };
  }
}
