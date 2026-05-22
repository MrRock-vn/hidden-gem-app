import { PlacesService } from './places.service';
import { MediaService } from '../media/media.service';
import { CreatePlaceDto } from './dto/create-place.dto';
import { QueryPlaceDto } from './dto/query-place.dto';
export declare class PlacesController {
    private readonly placesService;
    private readonly mediaService;
    constructor(placesService: PlacesService, mediaService: MediaService);
    findAll(query: QueryPlaceDto, currentUserId?: string): Promise<{
        data: {
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
            location: string;
            address: string;
            tags: string[];
            is_published: boolean;
            like_count: number;
            comment_count: number;
            bookmark_count: number;
            created_at: Date;
            images: import("./entities/place-image.entity").PlaceImage[];
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
    findNearby(lat: number, lng: number, radius?: number, limit?: number, currentUserId?: string): Promise<{
        data: {
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
            location: string;
            address: string;
            tags: string[];
            is_published: boolean;
            like_count: number;
            comment_count: number;
            bookmark_count: number;
            created_at: Date;
            images: import("./entities/place-image.entity").PlaceImage[];
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
    getUserPlaces(userId: string, page?: number, limit?: number): Promise<{
        data: import("./entities/place.entity").Place[];
        meta: {
            page: number;
            limit: number;
            total: number;
            totalPages: number;
            hasMore: boolean;
        };
    }>;
    findOne(id: string, currentUserId?: string): Promise<{
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
        location: string;
        address: string;
        tags: string[];
        is_published: boolean;
        like_count: number;
        comment_count: number;
        bookmark_count: number;
        created_at: Date;
        images: import("./entities/place-image.entity").PlaceImage[];
        comments: import("../social/entities/comment.entity").Comment[];
    }>;
    create(userId: string, createPlaceDto: CreatePlaceDto, files?: Express.Multer.File[]): Promise<{
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
        location: string;
        address: string;
        tags: string[];
        is_published: boolean;
        like_count: number;
        comment_count: number;
        bookmark_count: number;
        created_at: Date;
        images: import("./entities/place-image.entity").PlaceImage[];
        comments: import("../social/entities/comment.entity").Comment[];
    }>;
    private normalizeCreatePlaceDto;
    private parseTags;
    toggleLike(userId: string, placeId: string): Promise<{
        liked: boolean;
        like_count: number;
    }>;
    delete(placeId: string, userId: string): Promise<{
        message: string;
    }>;
    toggleBookmark(userId: string, placeId: string): Promise<{
        bookmarked: boolean;
        bookmark_count: number;
    }>;
}
