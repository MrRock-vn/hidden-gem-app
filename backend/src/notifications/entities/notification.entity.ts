import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Place } from '../../places/entities/place.entity';

export enum NotificationType {
  LIKE = 'like',
  COMMENT = 'comment',
  FOLLOW = 'follow',
  REPLY = 'reply',
}

@Entity('notifications')
export class Notification {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  user_id: string;

  @Column({ type: 'varchar', length: 50 })
  type: NotificationType;

  @Column({ type: 'uuid', nullable: true })
  actor_id: string;

  @Column({ type: 'uuid', nullable: true })
  place_id: string;

  @Column({ type: 'uuid', nullable: true })
  comment_id: string;

  @Column({ type: 'boolean', default: false })
  is_read: boolean;

  @ManyToOne(() => User, (user) => user.notifications, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => User, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'actor_id' })
  actor: User;

  @ManyToOne(() => Place, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'place_id' })
  place: Place;

  @CreateDateColumn({ type: 'timestamptz' })
  created_at: Date;
}
