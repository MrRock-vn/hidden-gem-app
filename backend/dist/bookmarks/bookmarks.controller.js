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
exports.BookmarksController = void 0;
const common_1 = require("@nestjs/common");
const bookmarks_service_1 = require("./bookmarks.service");
const current_user_decorator_1 = require("../auth/decorators/current-user.decorator");
let BookmarksController = class BookmarksController {
    bookmarksService;
    constructor(bookmarksService) {
        this.bookmarksService = bookmarksService;
    }
    async getMyCollections(userId) {
        return this.bookmarksService.getUserCollections(userId);
    }
    async createCollection(userId, name, isPublic) {
        return this.bookmarksService.createCollection(userId, name, isPublic);
    }
    async addPlace(userId, collectionId, placeId) {
        return this.bookmarksService.addPlaceToCollection(collectionId, placeId, userId);
    }
    async removePlace(userId, collectionId, placeId) {
        return this.bookmarksService.removePlaceFromCollection(collectionId, placeId, userId);
    }
    async deleteCollection(userId, collectionId) {
        return this.bookmarksService.deleteCollection(collectionId, userId);
    }
};
exports.BookmarksController = BookmarksController;
__decorate([
    (0, common_1.Get)('users/me/bookmarks'),
    __param(0, (0, current_user_decorator_1.CurrentUser)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], BookmarksController.prototype, "getMyCollections", null);
__decorate([
    (0, common_1.Post)('bookmarks/collections'),
    __param(0, (0, current_user_decorator_1.CurrentUser)('id')),
    __param(1, (0, common_1.Body)('name')),
    __param(2, (0, common_1.Body)('is_public')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Boolean]),
    __metadata("design:returntype", Promise)
], BookmarksController.prototype, "createCollection", null);
__decorate([
    (0, common_1.Post)('bookmarks/collections/:id/places'),
    __param(0, (0, current_user_decorator_1.CurrentUser)('id')),
    __param(1, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(2, (0, common_1.Body)('place_id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", Promise)
], BookmarksController.prototype, "addPlace", null);
__decorate([
    (0, common_1.Delete)('bookmarks/collections/:id/places/:placeId'),
    __param(0, (0, current_user_decorator_1.CurrentUser)('id')),
    __param(1, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(2, (0, common_1.Param)('placeId', common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", Promise)
], BookmarksController.prototype, "removePlace", null);
__decorate([
    (0, common_1.Delete)('bookmarks/collections/:id'),
    __param(0, (0, current_user_decorator_1.CurrentUser)('id')),
    __param(1, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], BookmarksController.prototype, "deleteCollection", null);
exports.BookmarksController = BookmarksController = __decorate([
    (0, common_1.Controller)(),
    __metadata("design:paramtypes", [bookmarks_service_1.BookmarksService])
], BookmarksController);
//# sourceMappingURL=bookmarks.controller.js.map