import { NotificationsService } from './notifications.service';
export declare class NotificationsController {
    private readonly notificationsService;
    constructor(notificationsService: NotificationsService);
    getNotifications(userId: string, page?: number, limit?: number, unread?: string): Promise<{
        data: {
            id: string;
            type: import("./entities/notification.entity").NotificationType;
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
    markAsRead(userId: string, notificationIds?: string[]): Promise<{
        message: string;
    }>;
    deleteNotification(notificationId: string, userId: string): Promise<{
        message: string;
    }>;
}
