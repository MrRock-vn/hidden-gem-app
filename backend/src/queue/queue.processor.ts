import { Process, Processor } from '@nestjs/bull';
import { Logger } from '@nestjs/common';
import type { Job } from 'bull';
import { MediaService } from '../media/media.service';
import { SearchService } from '../search/search.service';

@Processor('image-processing')
export class ImageProcessingProcessor {
  private readonly logger = new Logger(ImageProcessingProcessor.name);

  constructor(private mediaService: MediaService) {}

  @Process()
  async handleImageProcessing(job: Job) {
    try {
      this.logger.log(`Processing image job: ${job.id}`);

      const { buffer, filename, userId, placeId } = job.data;

      // Process and upload image
      const result = await this.mediaService.optimizeImage(buffer, {
        width: 1200,
        height: 900,
        quality: 80,
      });

      // Upload to S3
      const url = await this.mediaService.uploadFile(
        result,
        'place-image',
        filename,
      );

      this.logger.log(`Image processed successfully: ${url}`);
      return { url, filename, userId, placeId };
    } catch (error) {
      this.logger.error(`Failed to process image: ${job.id}`, error);
      throw error;
    }
  }
}

@Processor('email')
export class EmailProcessor {
  private readonly logger = new Logger(EmailProcessor.name);

  @Process()
  async handleEmail(job: Job) {
    try {
      this.logger.log(`Sending email job: ${job.id}`);

      const { to, subject, template, data } = job.data;

      // TODO: Implement email sending (use nodemailer, SendGrid, etc.)
      // For now, just log
      this.logger.log(`Email would be sent to ${to}: ${subject}`);

      return { sent: true, to, subject };
    } catch (error) {
      this.logger.error(`Failed to send email: ${job.id}`, error);
      throw error;
    }
  }
}

@Processor('search-indexing')
export class SearchIndexingProcessor {
  private readonly logger = new Logger(SearchIndexingProcessor.name);

  constructor(private searchService: SearchService) {}

  @Process()
  async handleSearchIndexing(job: Job) {
    try {
      this.logger.log(`Indexing search job: ${job.id}`);

      const { type, id, action, data } = job.data;

      if (action === 'index') {
        // Index the document in Elasticsearch
        if (type === 'place') {
          await this.searchService.indexPlace(id, data);
        } else if (type === 'user') {
          await this.searchService.indexUser(id, data);
        }
      } else if (action === 'delete') {
        // Remove from Elasticsearch
        if (type === 'place') {
          await this.searchService.deleteFromIndex('places', id);
        } else if (type === 'user') {
          await this.searchService.deleteFromIndex('users', id);
        }
      }

      this.logger.log(`Search index updated: ${type}/${id}/${action}`);
      return { indexed: true, type, id, action };
    } catch (error) {
      this.logger.error(`Failed to index search: ${job.id}`, error);
      throw error;
    }
  }
}

@Processor('notifications')
export class NotificationsProcessor {
  private readonly logger = new Logger(NotificationsProcessor.name);

  @Process()
  async handleNotification(job: Job) {
    try {
      this.logger.log(`Processing notification job: ${job.id}`);

      const { userId, title, body, data } = job.data;

      // TODO: Implement notification sending logic here
      // This could be for digest notifications, scheduled reminders, etc.

      this.logger.log(`Notification processed for user: ${userId}`);
      return { notified: true, userId };
    } catch (error) {
      this.logger.error(`Failed to process notification: ${job.id}`, error);
      throw error;
    }
  }
}
