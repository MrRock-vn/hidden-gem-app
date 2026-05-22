import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { APP_GUARD } from '@nestjs/core';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { PlacesModule } from './places/places.module';
import { SocialModule } from './social/social.module';
import { BookmarksModule } from './bookmarks/bookmarks.module';
import { NotificationsModule } from './notifications/notifications.module';
import { SearchModule } from './search/search.module';
import { RealtimeModule } from './realtime/realtime.module';
import { QueueModule } from './queue/queue.module';
import { AppConfigModule } from './config/config.module';
import { EnvValidationService } from './config/env-validation.service';
import { JwtAuthGuard } from './auth/guards/jwt-auth.guard';
import { AppController } from './app.controller';
import { AppService } from './app.service';

// Entities
import { User } from './users/entities/user.entity';
import { Place } from './places/entities/place.entity';
import { PlaceImage } from './places/entities/place-image.entity';
import { Like } from './social/entities/like.entity';
import { Comment } from './social/entities/comment.entity';
import { Follow } from './social/entities/follow.entity';
import { Block } from './social/entities/block.entity';
import { BookmarkCollection } from './bookmarks/entities/bookmark-collection.entity';
import { Bookmark } from './bookmarks/entities/bookmark.entity';
import { Notification } from './notifications/entities/notification.entity';
import { Conversation } from './chat/entities/conversation.entity';
import { Message } from './chat/entities/message.entity';
import { ChatModule } from './chat/chat.module';

@Module({
  imports: [
    // Config
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),

    // Database
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get('DATABASE_HOST', 'localhost'),
        port: configService.get<number>('DATABASE_PORT', 5432),
        username: configService.get('DATABASE_USERNAME', 'postgres'),
        password: configService.get('DATABASE_PASSWORD', 'password'),
        database: configService.get('DATABASE_NAME', 'hiddenGem'),
        entities: [
          User,
          Place,
          PlaceImage,
          Like,
          Comment,
          Follow,
          Block,
          BookmarkCollection,
          Bookmark,
          Notification,
          Conversation,
          Message,
        ],
        synchronize:
          configService.get('NODE_ENV') !== 'production' &&
          configService.get<string>('TYPEORM_SYNCHRONIZE') === 'true',
        logging: configService.get('NODE_ENV') === 'development',
      }),
    }),

    // Serve uploaded files
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'uploads'),
      serveRoot: '/uploads',
    }),

    // Feature modules
    AuthModule,
    UsersModule,
    PlacesModule,
    SocialModule,
    BookmarksModule,
    NotificationsModule,
    SearchModule,
    RealtimeModule,
    QueueModule,
    AppConfigModule,
    ChatModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    // Global JWT Guard - all routes require auth by default
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
  ],
})
export class AppModule {}
