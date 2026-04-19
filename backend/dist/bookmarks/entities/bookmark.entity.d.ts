import { BookmarkCollection } from './bookmark-collection.entity';
import { Place } from '../../places/entities/place.entity';
export declare class Bookmark {
    collection_id: string;
    place_id: string;
    collection: BookmarkCollection;
    place: Place;
    created_at: Date;
}
