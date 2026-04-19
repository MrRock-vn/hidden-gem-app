import { Place } from '../../places/entities/place.entity';
import { Comment } from '../../social/entities/comment.entity';
import { Notification } from '../../notifications/entities/notification.entity';
import { BookmarkCollection } from '../../bookmarks/entities/bookmark-collection.entity';
export declare class User {
    id: string;
    username: string;
    email: string;
    password?: string;
    avatar_url?: string;
    bio?: string;
    city?: string;
    is_private: boolean;
    google_id?: string;
    apple_id?: string;
    refresh_token?: string;
    created_at: Date;
    places: Place[];
    comments: Comment[];
    notifications: Notification[];
    bookmark_collections: BookmarkCollection[];
}
