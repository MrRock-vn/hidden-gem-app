import { Entity, PrimaryColumn, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { BookmarkCollection } from './bookmark-collection.entity';
import { Place } from '../../places/entities/place.entity';

@Entity('bookmarks')
export class Bookmark {
  @PrimaryColumn({ type: 'uuid' })
  collection_id: string;

  @PrimaryColumn({ type: 'uuid' })
  place_id: string;

  @ManyToOne(() => BookmarkCollection, (collection) => collection.bookmarks, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'collection_id' })
  collection: BookmarkCollection;

  @ManyToOne(() => Place, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'place_id' })
  place: Place;

  @CreateDateColumn({ type: 'timestamptz' })
  created_at: Date;
}
