import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { QueueService } from './queue.service';
import {
  ImageProcessingProcessor,
  EmailProcessor,
  SearchIndexingProcessor,
  NotificationsProcessor,
} from './queue.processor';
import { MediaModule } from '../media/media.module';
import { SearchModule } from '../search/search.module';

@Module({
  imports: [
    MediaModule,
    SearchModule,
    BullModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        redis: {
          host: configService.get('REDIS_HOST', 'localhost'),
          port: configService.get('REDIS_PORT', 6379),
          password: configService.get('REDIS_PASSWORD'),
          db: configService.get('REDIS_DB', 0),
        },
        defaultJobOptions: {
          removeOnComplete: true,
          removeOnFail: false,
          attempts: 3,
          backoff: {
            type: 'exponential',
            delay: 2000,
          },
        },
        settings: {
          maxStalledCount: 2,
          maxStalledInterval: 5000,
          lockDuration: 30000,
          lockRenewTime: 15000,
          stalledInterval: 5000,
        },
      }),
    }),
    BullModule.registerQueue(
      { name: 'image-processing' },
      { name: 'email' },
      { name: 'notifications' },
      { name: 'search-indexing' },
    ),
  ],
  providers: [
    QueueService,
    ImageProcessingProcessor,
    EmailProcessor,
    SearchIndexingProcessor,
    NotificationsProcessor,
  ],
  exports: [QueueService],
})
export class QueueModule {}
