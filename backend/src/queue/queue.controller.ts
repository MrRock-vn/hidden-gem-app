import { Controller, Get, Delete, Param } from '@nestjs/common';
import { QueueService } from './queue.service';

/**
 * Queue Management API
 * Endpoints for monitoring and managing background jobs
 */
@Controller('queue')
export class QueueController {
  constructor(private queueService: QueueService) {}

  /**
   * Get statistics for all queues
   * @returns Queue statistics (job counts by status)
   */
  @Get('stats')
  async getStats() {
    return this.queueService.getQueueStats();
  }

  /**
   * Clear completed jobs from all queues
   * Useful for cleanup without losing failed jobs for debugging
   */
  @Delete('completed')
  async clearCompleted() {
    await this.queueService.clearCompletedJobs();
    return { message: 'Cleared completed jobs from all queues' };
  }

  /**
   * Purge an entire queue
   * WARNING: This deletes all jobs in the queue!
   * @param queue Queue name (image-processing, email, notifications, search-indexing)
   */
  @Delete(':queue')
  async purgeQueue(@Param('queue') queue: string) {
    const count = await this.queueService.purgeQueue(queue);
    return { message: `Purged ${count} jobs from ${queue} queue` };
  }
}
