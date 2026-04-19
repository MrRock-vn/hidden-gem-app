import { Entity, PrimaryColumn, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from '../../users/entities/user.entity';

@Entity('blocks')
export class Block {
  @PrimaryColumn({ type: 'uuid' })
  blocker_id: string;

  @PrimaryColumn({ type: 'uuid' })
  blocked_id: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'blocker_id' })
  blocker: User;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'blocked_id' })
  blocked: User;

  @CreateDateColumn({ type: 'timestamptz' })
  created_at: Date;
}
