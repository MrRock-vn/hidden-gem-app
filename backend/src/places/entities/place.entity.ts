import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
  Index,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { PlaceImage } from './place-image.entity';
import { Comment } from '../../social/entities/comment.entity';

@Entity('places')
export class Place {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  user_id: string;

  @ManyToOne(() => User, (user) => user.places, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ type: 'varchar', length: 200 })
  title: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  category: string;

  @Column({ type: 'float' })
  latitude: number;

  @Column({ type: 'float' })
  longitude: number;

  // PostGIS geography column for efficient geo queries
  // Updated automatically when lat/lng change via trigger or application logic
  @Column({
    type: 'geography',
    spatialFeatureType: 'Point',
    srid: 4326,
    nullable: true,
  })
  location: string;

  @Column({ type: 'text', nullable: true })
  address: string;

  @Column({ type: 'text', array: true, default: '{}' })
  tags: string[];

  @Column({ type: 'boolean', default: true })
  is_published: boolean;

  @Column({ type: 'int', default: 0 })
  like_count: number;

  @Column({ type: 'int', default: 0 })
  comment_count: number;

  @Column({ type: 'int', default: 0 })
  bookmark_count: number;

  @CreateDateColumn({ type: 'timestamptz' })
  created_at: Date;

  @OneToMany(() => PlaceImage, (image) => image.place, { cascade: true })
  images: PlaceImage[];

  @OneToMany(() => Comment, (comment) => comment.place)
  comments: Comment[];
}
