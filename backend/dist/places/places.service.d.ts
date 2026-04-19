import { Repository } from 'typeorm';
import { Place } from './entities/place.entity';
import { PlaceImage } from './entities/place-image.entity';
import { Like } from '../social/entities/like.entity';
import { Bookmark } from '../bookmarks/entities/bookmark.entity';
import { CreatePlaceDto } from './dto/create-place.dto';
import { QueryPlaceDto } from './dto/query-place.dto';
export declare class PlacesService {
    private placesRepository;
    private placeImagesRepository;
    private likesRepository;
    private bookmarksRepository;
    constructor(placesRepository: Repository<Place>, placeImagesRepository: Repository<PlaceImage>, likesRepository: Repository<Like>, bookmarksRepository: Repository<Bookmark>);
    create(userId: string, createPlaceDto: CreatePlaceDto, imageUrls?: string[]): Promise<{
        user: {
            id: string;
            username: string;
            avatar_url: string | undefined;
        } | null;
        is_liked: boolean;
        is_bookmarked: boolean;
        id: string;
        user_id: string;
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
        comments: import("../social/entities/comment.entity").Comment[];
    }>;
    findAll(query: QueryPlaceDto): Promise<{
        data: {
            user: {
                id: string;
                username: string;
                avatar_url: string | undefined;
            } | null;
            id: string;
            user_id: string;
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
            comments: import("../social/entities/comment.entity").Comment[];
        }[];
        meta: {
            page: number;
            limit: number;
            total: number;
            totalPages: number;
            hasMore: boolean;
        };
    }>;
    findById(id: string, currentUserId?: string): Promise<{
        user: {
            id: string;
            username: string;
            avatar_url: string | undefined;
        } | null;
        is_liked: boolean;
        is_bookmarked: boolean;
        id: string;
        user_id: string;
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
        comments: import("../social/entities/comment.entity").Comment[];
    }>;
    findNearby(lat: number, lng: number, radius?: number, limit?: number): Promise<{
        data: {
            user: {
                id: string;
                username: string;
                avatar_url: string | undefined;
            } | null;
            id: string;
            user_id: string;
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
            comments: import("../social/entities/comment.entity").Comment[];
        }[];
        meta: {
            page: number;
            limit: number;
            total: number;
            totalPages: number;
            hasMore: boolean;
        };
    }>;
    toggleLike(userId: string, placeId: string): Promise<{
        liked: boolean;
        like_count: number;
    }>;
    deletePlace(placeId: string, userId: string): Promise<{
        message: string;
    }>;
    getUserPlaces(userId: string, page?: number, limit?: number): Promise<{
        data: Place[];
        meta: {
            page: number;
            limit: number;
            total: number;
            totalPages: number;
            hasMore: boolean;
        };
    }>;
}
