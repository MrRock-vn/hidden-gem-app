import { Injectable, Logger } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bull';
import type { Queue } from 'bull';

export interface ProcessImageJobData {
  buffer: Buffer;
  filename: string;
  userId: string;
  placeId?: string;
}

export interface SendEmailJobData {
  to: string;
  subject: string;
  template: string;
  data: Record<string, any>;
}

export interface IndexSearchJobData {
  type: 'place' | 'user';
  id: string;
  action: 'index' | 'delete';
  data?: Record<string, any>;
}

@Injectable()
export class QueueService {
  private readonly logger = new Logger(QueueService.name);

  constructor(
    @InjectQueue('image-processing')
    private imageProcessingQueue: Queue,
    @InjectQueue('email')
    private emailQueue: Queue,
    @InjectQueue('notifications')
    private notificationsQueue: Queue,
    @InjectQueue('search-indexing')
    private searchIndexingQueue: Queue,
  ) {}

  /**
   * Queue an image for processing (resize, optimize, upload)
   */
  async queueImageProcessing(data: ProcessImageJobData) {
    try {
      const job = await this.imageProcessingQueue.add(data, {
        jobId: `image-${data.userId}-${Date.now()}`,
        priority: data.placeId ? 5 : 1, // Place images get higher priority
      });
      this.logger.log(`Image processing job queued: ${job.id}`);
      return job;
    } catch (error) {
      this.logger.error('Failed to queue image processing', error);
      throw error;
    }
  }

  /**
   * Queue an email for sending
   */
  async queueEmail(data: SendEmailJobData) {
    try {
      const job = await this.emailQueue.add(data, {
        jobId: `email-${data.to}-${Date.now()}`,
        priority: data.template === 'password-reset' ? 10 : 1,
      });
      this.logger.log(`Email job queued: ${job.id}`);
      return job;
    } catch (error) {
      this.logger.error('Failed to queue email', error);
      throw error;
    }
  }

  /**
   * Queue search index update
   */
  async queueSearchIndex(data: IndexSearchJobData) {
    try {
      const jobId = `search-${data.type}-${data.id}-${data.action}-${Date.now()}`;
      const job = await this.searchIndexingQueue.add(data, {
        jobId,
        priority: 3,
      });
      this.logger.log(`Search index job queued: ${job.id}`);
      return job;
    } catch (error) {
      this.logger.error('Failed to queue search index', error);
      throw error;
    }
  }

  /**
   * Get queue statistics
   */
  async getQueueStats() {
    try {
      const imageStats = await this.imageProcessingQueue.getJobCounts();
      const emailStats = await this.emailQueue.getJobCounts();
      const notifStats = await this.notificationsQueue.getJobCounts();
      const searchStats = await this.searchIndexingQueue.getJobCounts();

      return {
        imageProcessing: imageStats,
        email: emailStats,
        notifications: notifStats,
        searchIndexing: searchStats,
      };
    } catch (error) {
      this.logger.error('Failed to get queue stats', error);
      return {};
    }
  }

  /**
   * Clear all completed jobs
   */
  async clearCompletedJobs() {
    try {
      await this.imageProcessingQueue.clean(0, 'completed');
      await this.emailQueue.clean(0, 'completed');
      await this.notificationsQueue.clean(0, 'completed');
      await this.searchIndexingQueue.clean(0, 'completed');
      this.logger.log('Cleared completed jobs from all queues');
    } catch (error) {
      this.logger.error('Failed to clear completed jobs', error);
    }
  }

  /**
   * Purge entire queue (use with caution!)
   */
  async purgeQueue(queueName: string) {
    try {
      let queue: Queue;
      switch (queueName) {
        case 'image-processing':
          queue = this.imageProcessingQueue;
          break;
        case 'email':
          queue = this.emailQueue;
          break;
        case 'notifications':
          queue = this.notificationsQueue;
          break;
        case 'search-indexing':
          queue = this.searchIndexingQueue;
          break;
        default:
          throw new Error(`Unknown queue: ${queueName}`);
      }

      const count = await queue.count();
      await queue.empty();
      this.logger.warn(`Purged ${count} jobs from ${queueName} queue`);
      return count;
    } catch (error) {
      this.logger.error(`Failed to purge queue: ${queueName}`, error);
      throw error;
    }
  }
}
