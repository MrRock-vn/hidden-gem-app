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
exports.BookmarksService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const bookmark_collection_entity_1 = require("./entities/bookmark-collection.entity");
const bookmark_entity_1 = require("./entities/bookmark.entity");
const place_entity_1 = require("../places/entities/place.entity");
let BookmarksService = class BookmarksService {
    collectionsRepository;
    bookmarksRepository;
    placesRepository;
    constructor(collectionsRepository, bookmarksRepository, placesRepository) {
        this.collectionsRepository = collectionsRepository;
        this.bookmarksRepository = bookmarksRepository;
        this.placesRepository = placesRepository;
    }
    async getUserCollections(userId) {
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
    async createCollection(userId, name, isPublic = false) {
        const collection = this.collectionsRepository.create({
            user_id: userId,
            name,
            is_public: isPublic,
        });
        return this.collectionsRepository.save(collection);
    }
    async addPlaceToCollection(collectionId, placeId, userId) {
        const collection = await this.collectionsRepository.findOne({
            where: { id: collectionId, user_id: userId },
        });
        if (!collection)
            throw new common_1.NotFoundException('Không tìm thấy bộ sưu tập');
        const place = await this.placesRepository.findOne({ where: { id: placeId } });
        if (!place)
            throw new common_1.NotFoundException('Không tìm thấy địa điểm');
        const existing = await this.bookmarksRepository.findOne({
            where: { collection_id: collectionId, place_id: placeId },
        });
        if (existing)
            return { message: 'Đã có trong bộ sưu tập' };
        const bookmark = this.bookmarksRepository.create({
            collection_id: collectionId,
            place_id: placeId,
        });
        await this.bookmarksRepository.save(bookmark);
        await this.placesRepository.increment({ id: placeId }, 'bookmark_count', 1);
        return { message: 'Đã thêm vào bộ sưu tập' };
    }
    async removePlaceFromCollection(collectionId, placeId, userId) {
        const collection = await this.collectionsRepository.findOne({
            where: { id: collectionId, user_id: userId },
        });
        if (!collection)
            throw new common_1.NotFoundException('Không tìm thấy bộ sưu tập');
        const bookmark = await this.bookmarksRepository.findOne({
            where: { collection_id: collectionId, place_id: placeId },
        });
        if (!bookmark)
            throw new common_1.NotFoundException('Địa điểm không có trong bộ sưu tập');
        await this.bookmarksRepository.remove(bookmark);
        await this.placesRepository.decrement({ id: placeId }, 'bookmark_count', 1);
        return { message: 'Đã xóa khỏi bộ sưu tập' };
    }
    async deleteCollection(collectionId, userId) {
        const collection = await this.collectionsRepository.findOne({
            where: { id: collectionId, user_id: userId },
        });
        if (!collection)
            throw new common_1.NotFoundException('Không tìm thấy bộ sưu tập');
        await this.collectionsRepository.remove(collection);
        return { message: 'Đã xóa bộ sưu tập' };
    }
};
exports.BookmarksService = BookmarksService;
exports.BookmarksService = BookmarksService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(bookmark_collection_entity_1.BookmarkCollection)),
    __param(1, (0, typeorm_1.InjectRepository)(bookmark_entity_1.Bookmark)),
    __param(2, (0, typeorm_1.InjectRepository)(place_entity_1.Place)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository])
], BookmarksService);
//# sourceMappingURL=bookmarks.service.js.map