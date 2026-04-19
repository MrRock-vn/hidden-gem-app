import { User } from '../../users/entities/user.entity';
import { Bookmark } from './bookmark.entity';
export declare class BookmarkCollection {
    id: string;
    user_id: string;
    name: string;
    is_public: boolean;
    user: User;
    bookmarks: Bookmark[];
    created_at: Date;
}
