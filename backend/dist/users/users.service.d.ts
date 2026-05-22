import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { UpdateUserDto } from './dto/update-user.dto';
import { Follow } from '../social/entities/follow.entity';
import { Block } from '../social/entities/block.entity';
export declare class UsersService {
    private usersRepository;
    private followsRepository;
    private blocksRepository;
    constructor(usersRepository: Repository<User>, followsRepository: Repository<Follow>, blocksRepository: Repository<Block>);
    findById(id: string): Promise<{
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
    getProfile(userId: string, currentUserId?: string): Promise<{
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
    updateAvatar(userId: string, avatarUrl: string): Promise<{
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
    updateEmail(userId: string, email: string): Promise<{
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
    updatePassword(userId: string, currentPassword: string, newPassword: string): Promise<{
        message: string;
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
    getBlockedUsers(userId: string): Promise<{
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
    }[]>;
    updateDeviceToken(userId: string, deviceToken: string | null): Promise<{
        success: boolean;
        message: string;
    }>;
    deleteAccount(userId: string): Promise<{
        message: string;
    }>;
    private sanitizeUser;
}
