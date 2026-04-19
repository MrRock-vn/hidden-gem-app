import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MulterModule } from '@nestjs/platform-express';
import { memoryStorage } from 'multer'; // Use memory storage instead of disk
import { PlacesService } from './places.service';
import { PlacesController } from './places.controller';
import { MediaModule } from '../media/media.module';
import { NotificationsModule } from '../notifications/notifications.module';
import { Place } from './entities/place.entity';
import { PlaceImage } from './entities/place-image.entity';
import { Like } from '../social/entities/like.entity';
import { Bookmark } from '../bookmarks/entities/bookmark.entity';
import { User } from '../users/entities/user.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Place, PlaceImage, Like, Bookmark, User]),
    MediaModule,
    NotificationsModule,
    MulterModule.register({
      storage: memoryStorage(), // Store in memory for Sharp processing
      fileFilter: (req, file, cb) => {
        if (file.mimetype.match(/\/(jpg|jpeg|png|gif|webp)$/)) {
          cb(null, true);
        } else {
          cb(new Error('Chỉ chấp nhận file ảnh (jpg, png, gif, webp)'), false);
        }
      },
      limits: {
        fileSize: 10 * 1024 * 1024, // 10MB
      },
    }),
  ],
  controllers: [PlacesController],
  providers: [PlacesService],
  exports: [PlacesService],
})
export class PlacesModule {}
