import { User } from '../../users/entities/user.entity';
export declare class Block {
    blocker_id: string;
    blocked_id: string;
    blocker: User;
    blocked: User;
    created_at: Date;
}
