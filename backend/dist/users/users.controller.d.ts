import { UsersService } from './users.service';
import { MediaService } from '../media/media.service';
import { UpdateUserDto } from './dto/update-user.dto';
export declare class UsersController {
    private readonly usersService;
    private readonly mediaService;
    constructor(usersService: UsersService, mediaService: MediaService);
    getUser(id: string, currentUserId?: string): Promise<{
        followers_count: number;
        following_count: number;
        is_following: boolean;
        is_blocked: boolean;
        id: string;
        username: string;
        email: string;
        avatar_url?: string;
        bio?: string;
        city?: string;
        is_private: boolean;
        device_token?: string;
        push_notifications_enabled: boolean;
        created_at: Date;
        places: import("../places/entities/place.entity").Place[];
        comments: import("../social/entities/comment.entity").Comment[];
        notifications: import("../notifications/entities/notification.entity").Notification[];
        bookmark_collections: import("../bookmarks/entities/bookmark-collection.entity").BookmarkCollection[];
    }>;
    updateProfile(userId: string, updateUserDto: UpdateUserDto): Promise<{
        id: string;
        username: string;
        email: string;
        avatar_url?: string;
        bio?: string;
        city?: string;
        is_private: boolean;
        device_token?: string;
        push_notifications_enabled: boolean;
        created_at: Date;
        places: import("../places/entities/place.entity").Place[];
        comments: import("../social/entities/comment.entity").Comment[];
        notifications: import("../notifications/entities/notification.entity").Notification[];
        bookmark_collections: import("../bookmarks/entities/bookmark-collection.entity").BookmarkCollection[];
    }>;
    updateAvatar(userId: string, file?: Express.Multer.File): Promise<{
        id: string;
        username: string;
        email: string;
        avatar_url?: string;
        bio?: string;
        city?: string;
        is_private: boolean;
        device_token?: string;
        push_notifications_enabled: boolean;
        created_at: Date;
        places: import("../places/entities/place.entity").Place[];
        comments: import("../social/entities/comment.entity").Comment[];
        notifications: import("../notifications/entities/notification.entity").Notification[];
        bookmark_collections: import("../bookmarks/entities/bookmark-collection.entity").BookmarkCollection[];
    }>;
    getSettings(userId: string): Promise<{
        push_notifications: boolean;
        is_private: boolean;
        dark_mode: boolean;
        email: string;
    }>;
    updateSettings(userId: string, settings: {
        is_private?: boolean;
        push_notifications?: boolean;
        dark_mode?: boolean;
    }): Promise<{
        push_notifications: boolean;
        is_private: boolean;
        dark_mode: boolean;
        email: string;
    }>;
    blockUser(blockerId: string, blockedId: string): Promise<{
        blocked: boolean;
    }>;
    registerDeviceToken(userId: string, token: string): Promise<{
        success: boolean;
        message: string;
    }>;
    unregisterDeviceToken(userId: string): Promise<{
        success: boolean;
        message: string;
    }>;
}
