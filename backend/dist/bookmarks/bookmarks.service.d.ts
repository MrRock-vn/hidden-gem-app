import { Repository } from 'typeorm';
import { BookmarkCollection } from './entities/bookmark-collection.entity';
import { Bookmark } from './entities/bookmark.entity';
import { Place } from '../places/entities/place.entity';
export declare class BookmarksService {
    private collectionsRepository;
    private bookmarksRepository;
    private placesRepository;
    constructor(collectionsRepository: Repository<BookmarkCollection>, bookmarksRepository: Repository<Bookmark>, placesRepository: Repository<Place>);
    getUserCollections(userId: string): Promise<{
        place_count: number;
        preview_images: string[];
        id: string;
        user_id: string;
        name: string;
        is_public: boolean;
        user: import("../users/entities/user.entity").User;
        bookmarks: Bookmark[];
        created_at: Date;
    }[]>;
    createCollection(userId: string, name: string, isPublic?: boolean): Promise<BookmarkCollection>;
    addPlaceToCollection(collectionId: string, placeId: string, userId: string): Promise<{
        message: string;
    }>;
    removePlaceFromCollection(collectionId: string, placeId: string, userId: string): Promise<{
        message: string;
    }>;
    deleteCollection(collectionId: string, userId: string): Promise<{
        message: string;
    }>;
}
