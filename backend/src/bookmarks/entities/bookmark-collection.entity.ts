import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Bookmark } from './bookmark.entity';

@Entity('bookmark_collections')
export class BookmarkCollection {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  user_id: string;

  @Column({ type: 'varchar', length: 100 })
  name: string;

  @Column({ type: 'boolean', default: false })
  is_public: boolean;

  @ManyToOne(() => User, (user) => user.bookmark_collections, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @OneToMany(() => Bookmark, (bookmark) => bookmark.collection, { cascade: true })
  bookmarks: Bookmark[];

  @CreateDateColumn({ type: 'timestamptz' })
  created_at: Date;
}
