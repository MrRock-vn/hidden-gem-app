import { User } from '../../users/entities/user.entity';
import { Place } from '../../places/entities/place.entity';
export declare class Like {
    user_id: string;
    place_id: string;
    user: User;
    place: Place;
    created_at: Date;
}
