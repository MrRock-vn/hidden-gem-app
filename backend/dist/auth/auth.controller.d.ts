import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { GoogleAuthDto } from './dto/google-auth.dto';
export declare class AuthController {
    private readonly authService;
    constructor(authService: AuthService);
    register(registerDto: RegisterDto): Promise<{
        accessToken: string;
        refreshToken: string;
        user: {
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
        };
    }>;
    login(loginDto: LoginDto): Promise<{
        accessToken: string;
        refreshToken: string;
        user: {
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
        };
    }>;
    googleAuth(googleAuthDto: GoogleAuthDto): Promise<{
        user: {
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
        };
        accessToken: string;
        refreshToken: string;
    }>;
    appleAuth(appleAuthDto: GoogleAuthDto): Promise<void>;
    refreshToken(refreshToken: string): Promise<{
        accessToken: string;
        refreshToken: string;
    }>;
    logout(userId: string): Promise<{
        message: string;
    }>;
}
