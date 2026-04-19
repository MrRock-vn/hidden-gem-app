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
exports.SocialController = void 0;
const common_1 = require("@nestjs/common");
const social_service_1 = require("./social.service");
const create_comment_dto_1 = require("./dto/create-comment.dto");
const current_user_decorator_1 = require("../auth/decorators/current-user.decorator");
const public_decorator_1 = require("../auth/decorators/public.decorator");
let SocialController = class SocialController {
    socialService;
    constructor(socialService) {
        this.socialService = socialService;
    }
    async getPlaceComments(placeId, page, limit) {
        return this.socialService.getPlaceComments(placeId, page ? +page : undefined, limit ? +limit : undefined);
    }
    async createComment(userId, placeId, dto) {
        return this.socialService.createComment(userId, placeId, dto);
    }
    async deleteComment(commentId, userId) {
        return this.socialService.deleteComment(commentId, userId);
    }
    async likeComment(userId, commentId) {
        return this.socialService.likeComment(userId, commentId);
    }
    async followUser(followerId, followingId) {
        return this.socialService.followUser(followerId, followingId);
    }
    async unfollowUser(followerId, followingId) {
        return this.socialService.followUser(followerId, followingId);
    }
    async getFollowers(userId, page, limit) {
        return this.socialService.getFollowers(userId, page ? +page : undefined, limit ? +limit : undefined);
    }
    async getFollowing(userId, page, limit) {
        return this.socialService.getFollowing(userId, page ? +page : undefined, limit ? +limit : undefined);
    }
};
exports.SocialController = SocialController;
__decorate([
    (0, public_decorator_1.Public)(),
    (0, common_1.Get)('places/:placeId/comments'),
    __param(0, (0, common_1.Param)('placeId', common_1.ParseUUIDPipe)),
    __param(1, (0, common_1.Query)('page')),
    __param(2, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Number, Number]),
    __metadata("design:returntype", Promise)
], SocialController.prototype, "getPlaceComments", null);
__decorate([
    (0, common_1.Post)('places/:placeId/comments'),
    __param(0, (0, current_user_decorator_1.CurrentUser)('id')),
    __param(1, (0, common_1.Param)('placeId', common_1.ParseUUIDPipe)),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, create_comment_dto_1.CreateCommentDto]),
    __metadata("design:returntype", Promise)
], SocialController.prototype, "createComment", null);
__decorate([
    (0, common_1.Delete)('comments/:id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(1, (0, current_user_decorator_1.CurrentUser)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], SocialController.prototype, "deleteComment", null);
__decorate([
    (0, common_1.Post)('comments/:id/like'),
    __param(0, (0, current_user_decorator_1.CurrentUser)('id')),
    __param(1, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], SocialController.prototype, "likeComment", null);
__decorate([
    (0, common_1.Post)('users/:id/follow'),
    __param(0, (0, current_user_decorator_1.CurrentUser)('id')),
    __param(1, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], SocialController.prototype, "followUser", null);
__decorate([
    (0, common_1.Delete)('users/:id/follow'),
    __param(0, (0, current_user_decorator_1.CurrentUser)('id')),
    __param(1, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], SocialController.prototype, "unfollowUser", null);
__decorate([
    (0, public_decorator_1.Public)(),
    (0, common_1.Get)('users/:id/followers'),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(1, (0, common_1.Query)('page')),
    __param(2, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Number, Number]),
    __metadata("design:returntype", Promise)
], SocialController.prototype, "getFollowers", null);
__decorate([
    (0, public_decorator_1.Public)(),
    (0, common_1.Get)('users/:id/following'),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(1, (0, common_1.Query)('page')),
    __param(2, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Number, Number]),
    __metadata("design:returntype", Promise)
], SocialController.prototype, "getFollowing", null);
exports.SocialController = SocialController = __decorate([
    (0, common_1.Controller)(),
    __metadata("design:paramtypes", [social_service_1.SocialService])
], SocialController);
//# sourceMappingURL=social.controller.js.map