import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Notification, NotificationType } from './entities/notification.entity';

@Injectable()
export class NotificationsService {
  constructor(
    @InjectRepository(Notification)
    private notificationsRepository: Repository<Notification>,
  ) {}

  async getUserNotifications(userId: string, page: number = 1, limit: number = 20, unreadOnly: boolean = false) {
    const where: any = { user_id: userId };
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

  async createNotification(data: {
    userId: string;
    type: NotificationType;
    actorId: string;
    placeId?: string;
    commentId?: string;
  }) {
    // Don't notify yourself
    if (data.userId === data.actorId) return null;

    const notification = this.notificationsRepository.create({
      user_id: data.userId,
      type: data.type,
      actor_id: data.actorId,
      place_id: data.placeId,
      comment_id: data.commentId,
    });

    return this.notificationsRepository.save(notification);
  }

  async markAsRead(userId: string, notificationIds?: string[]) {
    if (notificationIds && notificationIds.length > 0) {
      await this.notificationsRepository
        .createQueryBuilder()
        .update()
        .set({ is_read: true })
        .where('user_id = :userId AND id IN (:...ids)', { userId, ids: notificationIds })
        .execute();
    } else {
      // Mark all as read
      await this.notificationsRepository.update(
        { user_id: userId, is_read: false },
        { is_read: true },
      );
    }
    return { message: 'Đã đánh dấu đã đọc' };
  }

  async deleteNotification(notificationId: string, userId: string) {
    await this.notificationsRepository.delete({ id: notificationId, user_id: userId });
    return { message: 'Đã xóa thông báo' };
  }
}
