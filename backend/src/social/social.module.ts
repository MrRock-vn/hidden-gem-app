import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SocialService } from './social.service';
import { SocialController } from './social.controller';
import { RealtimeModule } from '../realtime/realtime.module';
import { NotificationsModule } from '../notifications/notifications.module';
import { Comment } from './entities/comment.entity';
import { Follow } from './entities/follow.entity';
import { Like } from './entities/like.entity';
import { Block } from './entities/block.entity';
import { Place } from '../places/entities/place.entity';
import { User } from '../users/entities/user.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Comment, Follow, Like, Block, Place, User]),
    RealtimeModule,
    NotificationsModule,
  ],
  controllers: [SocialController],
  providers: [SocialService],
  exports: [SocialService],
})
export class SocialModule {}
