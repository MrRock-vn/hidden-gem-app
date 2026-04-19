import { Repository } from 'typeorm';
import { Comment } from './entities/comment.entity';
import { Follow } from './entities/follow.entity';
import { Like } from './entities/like.entity';
import { Place } from '../places/entities/place.entity';
import { CreateCommentDto } from './dto/create-comment.dto';
export declare class SocialService {
    private commentsRepository;
    private followsRepository;
    private likesRepository;
    private placesRepository;
    constructor(commentsRepository: Repository<Comment>, followsRepository: Repository<Follow>, likesRepository: Repository<Like>, placesRepository: Repository<Place>);
    getPlaceComments(placeId: string, page?: number, limit?: number): Promise<{
        data: {
            user: {
                id: string;
                username: string;
                avatar_url: string | undefined;
            } | null;
            replies: {
                user: {
                    id: string;
                    username: string;
                    avatar_url: string | undefined;
                } | null;
                id: string;
                user_id: string;
                place_id: string;
                parent_id?: string;
                content: string;
                like_count: number;
                place: Place;
                parent: Comment;
                replies: Comment[];
                created_at: Date;
            }[];
            id: string;
            user_id: string;
            place_id: string;
            parent_id?: string;
            content: string;
            like_count: number;
            place: Place;
            parent: Comment;
            created_at: Date;
        }[];
        meta: {
            page: number;
            limit: number;
            total: number;
            totalPages: number;
        };
    }>;
    createComment(userId: string, placeId: string, dto: CreateCommentDto): Promise<Comment | null>;
    deleteComment(commentId: string, userId: string): Promise<{
        message: string;
    }>;
    likeComment(userId: string, commentId: string): Promise<{
        liked: boolean;
        like_count: number;
    }>;
    followUser(followerId: string, followingId: string): Promise<{
        following: boolean;
    }>;
    getFollowers(userId: string, page?: number, limit?: number): Promise<{
        data: {
            id: string;
            username: string;
            avatar_url: string | undefined;
            bio: string | undefined;
            followed_at: Date;
        }[];
        meta: {
            page: number;
            limit: number;
            total: number;
            totalPages: number;
        };
    }>;
    getFollowing(userId: string, page?: number, limit?: number): Promise<{
        data: {
            id: string;
            username: string;
            avatar_url: string | undefined;
            bio: string | undefined;
            followed_at: Date;
        }[];
        meta: {
            page: number;
            limit: number;
            total: number;
            totalPages: number;
        };
    }>;
}
