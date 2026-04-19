import { JwtService } from '@nestjs/jwt';
import { Repository } from 'typeorm';
import { User } from '../users/entities/user.entity';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
export declare class AuthService {
    private usersRepository;
    private jwtService;
    constructor(usersRepository: Repository<User>, jwtService: JwtService);
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
            created_at: Date;
            places: import("../places/entities/place.entity").Place[];
            comments: import("../social/entities/comment.entity").Comment[];
            notifications: import("../notifications/entities/notification.entity").Notification[];
            bookmark_collections: import("../bookmarks/entities/bookmark-collection.entity").BookmarkCollection[];
        };
    }>;
    googleAuth(googleToken: string): Promise<{
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
            created_at: Date;
            places: import("../places/entities/place.entity").Place[];
            comments: import("../social/entities/comment.entity").Comment[];
            notifications: import("../notifications/entities/notification.entity").Notification[];
            bookmark_collections: import("../bookmarks/entities/bookmark-collection.entity").BookmarkCollection[];
        };
    }>;
    refreshToken(refreshToken: string): Promise<{
        accessToken: string;
        refreshToken: string;
    }>;
    logout(userId: string): Promise<{
        message: string;
    }>;
    private generateTokens;
    private sanitizeUser;
}
