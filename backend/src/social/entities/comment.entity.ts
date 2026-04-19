import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Place } from '../../places/entities/place.entity';

@Entity('comments')
export class Comment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  user_id: string;

  @Column({ type: 'uuid' })
  place_id: string;

  @Column({ type: 'uuid', nullable: true })
  parent_id?: string;

  @Column({ type: 'text' })
  content: string;

  @Column({ type: 'int', default: 0 })
  like_count: number;

  @ManyToOne(() => User, (user) => user.comments, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => Place, (place) => place.comments, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'place_id' })
  place: Place;

  @ManyToOne(() => Comment, (comment) => comment.replies, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'parent_id' })
  parent: Comment;

  @OneToMany(() => Comment, (comment) => comment.parent)
  replies: Comment[];

  @CreateDateColumn({ type: 'timestamptz' })
  created_at: Date;
}
