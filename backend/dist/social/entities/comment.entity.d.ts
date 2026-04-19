import { User } from '../../users/entities/user.entity';
import { Place } from '../../places/entities/place.entity';
export declare class Comment {
    id: string;
    user_id: string;
    place_id: string;
    parent_id?: string;
    content: string;
    like_count: number;
    user: User;
    place: Place;
    parent: Comment;
    replies: Comment[];
    created_at: Date;
}
