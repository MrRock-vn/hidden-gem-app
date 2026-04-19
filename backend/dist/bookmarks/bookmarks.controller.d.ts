import { BookmarksService } from './bookmarks.service';
export declare class BookmarksController {
    private readonly bookmarksService;
    constructor(bookmarksService: BookmarksService);
    getMyCollections(userId: string): Promise<{
        place_count: number;
        preview_images: string[];
        id: string;
        user_id: string;
        name: string;
        is_public: boolean;
        user: import("../users/entities/user.entity").User;
        bookmarks: import("./entities/bookmark.entity").Bookmark[];
        created_at: Date;
    }[]>;
    createCollection(userId: string, name: string, isPublic?: boolean): Promise<import("./entities/bookmark-collection.entity").BookmarkCollection>;
    addPlace(userId: string, collectionId: string, placeId: string): Promise<{
        message: string;
    }>;
    removePlace(userId: string, collectionId: string, placeId: string): Promise<{
        message: string;
    }>;
    deleteCollection(userId: string, collectionId: string): Promise<{
        message: string;
    }>;
}
