import { Repository } from 'typeorm';
import { Notification, NotificationType } from './entities/notification.entity';
export declare class NotificationsService {
    private notificationsRepository;
    constructor(notificationsRepository: Repository<Notification>);
    getUserNotifications(userId: string, page?: number, limit?: number, unreadOnly?: boolean): Promise<{
        data: {
            id: string;
            type: NotificationType;
            is_read: boolean;
            created_at: Date;
            actor: {
                id: string;
                username: string;
                avatar_url: string | undefined;
            } | null;
            place: {
                id: string;
                title: string;
            } | null;
        }[];
        meta: {
            page: number;
            limit: number;
            total: number;
            totalPages: number;
            unread_count: number;
        };
    }>;
    createNotification(data: {
        userId: string;
        type: NotificationType;
        actorId: string;
        placeId?: string;
        commentId?: string;
    }): Promise<Notification | null>;
    markAsRead(userId: string, notificationIds?: string[]): Promise<{
        message: string;
    }>;
    deleteNotification(notificationId: string, userId: string): Promise<{
        message: string;
    }>;
}
