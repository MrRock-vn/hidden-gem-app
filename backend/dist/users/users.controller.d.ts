import { UsersService } from './users.service';
import { UpdateUserDto } from './dto/update-user.dto';
export declare class UsersController {
    private readonly usersService;
    constructor(usersService: UsersService);
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
        created_at: Date;
        places: import("../places/entities/place.entity").Place[];
        comments: import("../social/entities/comment.entity").Comment[];
        notifications: import("../notifications/entities/notification.entity").Notification[];
        bookmark_collections: import("../bookmarks/entities/bookmark-collection.entity").BookmarkCollection[];
    }>;
    updateAvatar(userId: string, file: any): Promise<{
        id: string;
        username: string;
        email: string;
        avatar_url?: string;
        bio?: string;
        city?: string;
        is_private: boolean;
        created_at: Date;
        places: import("../places/entities/place.entity").Place[];
        comments: import("../social/entities/comment.entity").Comment[];
        notifications: import("../notifications/entities/notification.entity").Notification[];
        bookmark_collections: import("../bookmarks/entities/bookmark-collection.entity").BookmarkCollection[];
    }>;
    blockUser(blockerId: string, blockedId: string): Promise<{
        blocked: boolean;
    }>;
}
