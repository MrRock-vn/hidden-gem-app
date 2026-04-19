import { User } from '../../users/entities/user.entity';
import { PlaceImage } from './place-image.entity';
import { Comment } from '../../social/entities/comment.entity';
export declare class Place {
    id: string;
    user_id: string;
    user: User;
    title: string;
    description: string;
    category: string;
    latitude: number;
    longitude: number;
    address: string;
    tags: string[];
    is_published: boolean;
    like_count: number;
    comment_count: number;
    bookmark_count: number;
    created_at: Date;
    images: PlaceImage[];
    comments: Comment[];
}
