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
exports.SocialService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const comment_entity_1 = require("./entities/comment.entity");
const follow_entity_1 = require("./entities/follow.entity");
const like_entity_1 = require("./entities/like.entity");
const place_entity_1 = require("../places/entities/place.entity");
const user_entity_1 = require("../users/entities/user.entity");
const realtime_gateway_1 = require("../realtime/realtime.gateway");
const push_notification_service_1 = require("../notifications/push-notification.service");
let SocialService = class SocialService {
    commentsRepository;
    followsRepository;
    likesRepository;
    placesRepository;
    usersRepository;
    realtimeGateway;
    pushNotificationService;
    constructor(commentsRepository, followsRepository, likesRepository, placesRepository, usersRepository, realtimeGateway, pushNotificationService) {
        this.commentsRepository = commentsRepository;
        this.followsRepository = followsRepository;
        this.likesRepository = likesRepository;
        this.placesRepository = placesRepository;
        this.usersRepository = usersRepository;
        this.realtimeGateway = realtimeGateway;
        this.pushNotificationService = pushNotificationService;
    }
    async getPlaceComments(placeId, page = 1, limit = 20) {
        const [comments, total] = await this.commentsRepository.findAndCount({
            where: { place_id: placeId, parent_id: null },
            relations: ['user', 'replies', 'replies.user'],
            order: { created_at: 'DESC' },
            skip: (page - 1) * limit,
            take: limit,
        });
        return {
            data: comments.map((c) => ({
                ...c,
                user: c.user
                    ? {
                        id: c.user.id,
                        username: c.user.username,
                        avatar_url: c.user.avatar_url,
                    }
                    : null,
                replies: c.replies?.map((r) => ({
                    ...r,
                    user: r.user
                        ? {
                            id: r.user.id,
                            username: r.user.username,
                            avatar_url: r.user.avatar_url,
                        }
                        : null,
                })),
            })),
            meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
        };
    }
    async createComment(userId, placeId, dto) {
        const place = await this.placesRepository.findOne({
            where: { id: placeId },
            relations: ['user'],
        });
        if (!place)
            throw new common_1.NotFoundException('Không tìm thấy địa điểm');
        if (dto.parent_id) {
            const parent = await this.commentsRepository.findOne({
                where: { id: dto.parent_id, place_id: placeId },
            });
            if (!parent)
                throw new common_1.NotFoundException('Không tìm thấy bình luận gốc');
        }
        const comment = this.commentsRepository.create({
            user_id: userId,
            place_id: placeId,
            content: dto.content,
            parent_id: dto.parent_id || undefined,
        });
        const saved = await this.commentsRepository.save(comment);
        await this.placesRepository.increment({ id: placeId }, 'comment_count', 1);
        const fullComment = await this.commentsRepository.findOne({
            where: { id: saved.id },
            relations: ['user'],
        });
        this.realtimeGateway.emitNewComment(placeId, {
            id: fullComment.id,
            content: fullComment.content,
            created_at: fullComment.created_at,
            parent_id: fullComment.parent_id,
            user: {
                id: fullComment.user.id,
                username: fullComment.user.username,
                avatar_url: fullComment.user.avatar_url,
            },
        });
        if (place.user && place.user.id !== userId) {
            const owner = await this.usersRepository.findOne({
                where: { id: place.user.id },
            });
            if (owner?.device_token && owner.push_notifications_enabled) {
                await this.pushNotificationService.notifyNewComment(place.user.id, place.title, fullComment.user.username, dto.content, placeId);
            }
        }
        if (dto.mentioned_usernames && dto.mentioned_usernames.length > 0) {
            const mentionedUsers = await this.usersRepository.find({
                where: dto.mentioned_usernames.map((username) => ({ username })),
            });
            for (const user of mentionedUsers) {
                if (user.id !== userId &&
                    user.device_token &&
                    user.push_notifications_enabled) {
                    await this.pushNotificationService.notifyMention(user.id, fullComment.user.username, dto.content, placeId, 'comment');
                }
            }
        }
        return fullComment;
    }
    async deleteComment(commentId, userId) {
        const comment = await this.commentsRepository.findOne({
            where: { id: commentId },
        });
        if (!comment)
            throw new common_1.NotFoundException('Không tìm thấy bình luận');
        if (comment.user_id !== userId)
            throw new common_1.ForbiddenException('Không có quyền xóa');
        const placeId = comment.place_id;
        await this.commentsRepository.remove(comment);
        await this.placesRepository.decrement({ id: placeId }, 'comment_count', 1);
        this.realtimeGateway.emitCommentDeleted(placeId, commentId);
        return { message: 'Đã xóa bình luận' };
    }
    async likeComment(userId, commentId) {
        const comment = await this.commentsRepository.findOne({
            where: { id: commentId },
        });
        if (!comment)
            throw new common_1.NotFoundException('Không tìm thấy bình luận');
        comment.like_count += 1;
        await this.commentsRepository.save(comment);
        return { liked: true, like_count: comment.like_count };
    }
    async followUser(followerId, followingId) {
        if (followerId === followingId) {
            throw new common_1.ConflictException('Không thể follow bản thân');
        }
        const existing = await this.followsRepository.findOne({
            where: { follower_id: followerId, following_id: followingId },
        });
        if (existing) {
            await this.followsRepository.remove(existing);
            return { following: false };
        }
        const follow = this.followsRepository.create({
            follower_id: followerId,
            following_id: followingId,
        });
        await this.followsRepository.save(follow);
        const follower = await this.usersRepository.findOne({
            where: { id: followerId },
        });
        const followingUser = await this.usersRepository.findOne({
            where: { id: followingId },
        });
        if (followingUser?.device_token &&
            followingUser.push_notifications_enabled &&
            follower) {
            await this.pushNotificationService.notifyNewFollower(followingId, follower.username);
        }
        return { following: true };
    }
    async unfollowUser(followerId, followingId) {
        const existing = await this.followsRepository.findOne({
            where: { follower_id: followerId, following_id: followingId },
        });
        if (!existing) {
            throw new common_1.NotFoundException('Chưa follow người dùng này');
        }
        await this.followsRepository.remove(existing);
        return { following: false };
    }
    async getFollowers(userId, page = 1, limit = 20) {
        const [follows, total] = await this.followsRepository.findAndCount({
            where: { following_id: userId },
            relations: ['follower'],
            order: { created_at: 'DESC' },
            skip: (page - 1) * limit,
            take: limit,
        });
        return {
            data: follows.map((f) => ({
                id: f.follower.id,
                username: f.follower.username,
                avatar_url: f.follower.avatar_url,
                bio: f.follower.bio,
                followed_at: f.created_at,
            })),
            meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
        };
    }
    async getFollowing(userId, page = 1, limit = 20) {
        const [follows, total] = await this.followsRepository.findAndCount({
            where: { follower_id: userId },
            relations: ['following'],
            order: { created_at: 'DESC' },
            skip: (page - 1) * limit,
            take: limit,
        });
        return {
            data: follows.map((f) => ({
                id: f.following.id,
                username: f.following.username,
                avatar_url: f.following.avatar_url,
                bio: f.following.bio,
                followed_at: f.created_at,
            })),
            meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
        };
    }
};
exports.SocialService = SocialService;
exports.SocialService = SocialService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(comment_entity_1.Comment)),
    __param(1, (0, typeorm_1.InjectRepository)(follow_entity_1.Follow)),
    __param(2, (0, typeorm_1.InjectRepository)(like_entity_1.Like)),
    __param(3, (0, typeorm_1.InjectRepository)(place_entity_1.Place)),
    __param(4, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        realtime_gateway_1.RealtimeGateway,
        push_notification_service_1.PushNotificationService])
], SocialService);
//# sourceMappingURL=social.service.js.map