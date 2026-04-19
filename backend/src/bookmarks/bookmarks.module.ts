import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BookmarksService } from './bookmarks.service';
import { BookmarksController } from './bookmarks.controller';
import { BookmarkCollection } from './entities/bookmark-collection.entity';
import { Bookmark } from './entities/bookmark.entity';
import { Place } from '../places/entities/place.entity';

@Module({
  imports: [TypeOrmModule.forFeature([BookmarkCollection, Bookmark, Place])],
  controllers: [BookmarksController],
  providers: [BookmarksService],
  exports: [BookmarksService],
})
export class BookmarksModule {}
