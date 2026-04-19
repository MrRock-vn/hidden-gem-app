import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  OneToMany,
} from 'typeorm';
import { Place } from '../../places/entities/place.entity';
import { Comment } from '../../social/entities/comment.entity';
import { Notification } from '../../notifications/entities/notification.entity';
import { BookmarkCollection } from '../../bookmarks/entities/bookmark-collection.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 50, unique: true })
  username: string;

  @Column({ type: 'varchar', length: 255, unique: true })
  email: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  password?: string;

  @Column({ type: 'text', nullable: true })
  avatar_url?: string;

  @Column({ type: 'text', nullable: true })
  bio?: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  city?: string;

  @Column({ type: 'boolean', default: false })
  is_private: boolean;

  @Column({ type: 'varchar', nullable: true })
  google_id?: string;

  @Column({ type: 'varchar', nullable: true })
  apple_id?: string;

  @Column({ type: 'text', nullable: true })
  refresh_token?: string;

  @Column({ type: 'text', nullable: true })
  device_token?: string; // FCM device token for push notifications

  @Column({ type: 'boolean', default: true })
  push_notifications_enabled: boolean;

  @CreateDateColumn({ type: 'timestamptz' })
  created_at: Date;

  @OneToMany(() => Place, (place) => place.user)
  places: Place[];

  @OneToMany(() => Comment, (comment) => comment.user)
  comments: Comment[];

  @OneToMany(() => Notification, (notification) => notification.user)
  notifications: Notification[];

  @OneToMany(() => BookmarkCollection, (collection) => collection.user)
  bookmark_collections: BookmarkCollection[];
}
