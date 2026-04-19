import { User } from '../../users/entities/user.entity';
export declare class Follow {
    follower_id: string;
    following_id: string;
    follower: User;
    following: User;
    created_at: Date;
}
