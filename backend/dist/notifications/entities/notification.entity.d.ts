import { User } from '../../users/entities/user.entity';
import { Place } from '../../places/entities/place.entity';
export declare enum NotificationType {
    LIKE = "like",
    COMMENT = "comment",
    FOLLOW = "follow",
    REPLY = "reply"
}
export declare class Notification {
    id: string;
    user_id: string;
    type: NotificationType;
    actor_id: string;
    place_id: string;
    comment_id: string;
    is_read: boolean;
    user: User;
    actor: User;
    place: Place;
    created_at: Date;
}
