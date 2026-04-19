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
exports.NotificationsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const notification_entity_1 = require("./entities/notification.entity");
let NotificationsService = class NotificationsService {
    notificationsRepository;
    constructor(notificationsRepository) {
        this.notificationsRepository = notificationsRepository;
    }
    async getUserNotifications(userId, page = 1, limit = 20, unreadOnly = false) {
        const where = { user_id: userId };
        if (unreadOnly) {
            where.is_read = false;
        }
        const [notifications, total] = await this.notificationsRepository.findAndCount({
            where,
            relations: ['actor', 'place'],
            order: { created_at: 'DESC' },
            skip: (page - 1) * limit,
            take: limit,
        });
        const unreadCount = await this.notificationsRepository.count({
            where: { user_id: userId, is_read: false },
        });
        return {
            data: notifications.map((n) => ({
                id: n.id,
                type: n.type,
                is_read: n.is_read,
                created_at: n.created_at,
                actor: n.actor ? { id: n.actor.id, username: n.actor.username, avatar_url: n.actor.avatar_url } : null,
                place: n.place ? { id: n.place.id, title: n.place.title } : null,
            })),
            meta: { page, limit, total, totalPages: Math.ceil(total / limit), unread_count: unreadCount },
        };
    }
    async createNotification(data) {
        if (data.userId === data.actorId)
            return null;
        const notification = this.notificationsRepository.create({
            user_id: data.userId,
            type: data.type,
            actor_id: data.actorId,
            place_id: data.placeId,
            comment_id: data.commentId,
        });
        return this.notificationsRepository.save(notification);
    }
    async markAsRead(userId, notificationIds) {
        if (notificationIds && notificationIds.length > 0) {
            await this.notificationsRepository
                .createQueryBuilder()
                .update()
                .set({ is_read: true })
                .where('user_id = :userId AND id IN (:...ids)', { userId, ids: notificationIds })
                .execute();
        }
        else {
            await this.notificationsRepository.update({ user_id: userId, is_read: false }, { is_read: true });
        }
        return { message: 'Đã đánh dấu đã đọc' };
    }
    async deleteNotification(notificationId, userId) {
        await this.notificationsRepository.delete({ id: notificationId, user_id: userId });
        return { message: 'Đã xóa thông báo' };
    }
};
exports.NotificationsService = NotificationsService;
exports.NotificationsService = NotificationsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(notification_entity_1.Notification)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], NotificationsService);
//# sourceMappingURL=notifications.service.js.map