import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Place } from './place.entity';

@Entity('place_images')
export class PlaceImage {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  place_id: string;

  @ManyToOne(() => Place, (place) => place.images, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'place_id' })
  place: Place;

  @Column({ type: 'text' })
  url: string;

  @Column({ type: 'int', default: 0 })
  order_idx: number;
}
