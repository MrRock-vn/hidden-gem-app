import { Entity, PrimaryColumn, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from '../../users/entities/user.entity';

@Entity('follows')
export class Follow {
  @PrimaryColumn({ type: 'uuid' })
  follower_id: string;

  @PrimaryColumn({ type: 'uuid' })
  following_id: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'follower_id' })
  follower: User;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'following_id' })
  following: User;

  @CreateDateColumn({ type: 'timestamptz' })
  created_at: Date;
}
