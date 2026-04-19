# BullMQ Queue Setup Guide

This document describes the BullMQ background job queue system for Hidden Gem backend.

## Overview

BullMQ is a fast and reliable distributed task queue built on top of Redis. It's used for:

- Image processing and optimization
- Email sending
- Search index updates
- Notification batching
- Heavy computations that shouldn't block HTTP requests

## Architecture

### Queues

The system implements 4 queues:

1. **image-processing**: Process, resize, and upload images
2. **email**: Send transactional emails
3. **search-indexing**: Index/update Elasticsearch documents
4. **notifications**: Handle batch notifications and reminders

### Flow

```
User Request → Queue Job → Redis ← Worker Processing
    ↓                              ↓
  Fast                        Background
  Response                      Task
```

## Installation

### Dependencies

```bash
npm install bullmq redis
npm install @nestjs/bull  # Optional NestJS integration
```

### Environment Variables

Add to `.env`:

```env
# Redis Configuration
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=  # Optional
REDIS_DB=0

# Node Environment
NODE_ENV=development  # or production
```

## Configuration

### Module Import

The queue system is configured in `app.module.ts`:

```typescript
import { QueueModule } from './queue/queue.module';

@Module({
  imports: [
    // ... other modules
    QueueModule, // Add this
  ],
})
export class AppModule {}
```

### Queue Configuration

`src/queue/queue.module.ts` handles:

```typescript
BullModule.forRootAsync({
  redis: {
    host: process.env.REDIS_HOST,
    port: process.env.REDIS_PORT,
    password: process.env.REDIS_PASSWORD,
  },
  defaultJobOptions: {
    removeOnComplete: true, // Auto-remove completed jobs
    removeOnFail: false, // Keep failed jobs for debugging
    attempts: 3, // Retry 3 times
    backoff: {
      type: 'exponential', // 2s, 4s, 8s delays
      delay: 2000,
    },
  },
  settings: {
    maxStalledCount: 2, // Max retries for stalled jobs
    maxStalledInterval: 5000, // Check every 5s
    lockDuration: 30000, // Job lock timeout
    lockRenewTime: 15000, // Renew lock every 15s
  },
});
```

## Usage

### Queueing a Job

#### Image Processing

```typescript
import { QueueService } from './queue/queue.service';

constructor(private queueService: QueueService) {}

async uploadImage(buffer: Buffer, filename: string, userId: string) {
  // Queue the image processing job
  await this.queueService.queueImageProcessing({
    buffer,
    filename,
    userId,
    placeId: '123',  // Optional
  });

  // Return immediately to user
  return { status: 'processing' };
}
```

#### Search Indexing

```typescript
// Index a place when created
await this.queueService.queueSearchIndex({
  type: 'place',
  id: place.id,
  action: 'index',
  data: { title, description, latitude, longitude, ... },
});

// Delete from index when removed
await this.queueService.queueSearchIndex({
  type: 'place',
  id: place.id,
  action: 'delete',
});
```

#### Email Sending

```typescript
await this.queueService.queueEmail({
  to: user.email,
  subject: 'Welcome to Hidden Gem!',
  template: 'welcome',
  data: { username: user.username },
});
```

### Processing Jobs

Jobs are processed in `src/queue/queue.processor.ts`:

```typescript
@Processor('image-processing')
export class ImageProcessingProcessor {
  @Process()
  async handleImageProcessing(job: Job) {
    const { buffer, filename, userId } = job.data;

    // Process image
    const optimized = await this.mediaService.optimizeImage(buffer);
    const url = await this.mediaService.uploadFile(
      optimized,
      'place',
      filename,
    );

    return { url, filename };
  }
}
```

### Monitoring Queue Health

#### Get Queue Statistics

```bash
GET /queue/stats
```

Response:

```json
{
  "imageProcessing": {
    "active": 2,
    "completed": 150,
    "failed": 3,
    "delayed": 0,
    "waiting": 5
  },
  "email": { ... },
  "searchIndexing": { ... },
  "notifications": { ... }
}
```

#### Clear Completed Jobs

```bash
DELETE /queue/completed
```

Removes all successfully completed jobs from all queues (useful for cleanup).

#### Purge Queue

```bash
DELETE /queue/image-processing
```

WARNING: Removes ALL jobs from the queue!

## Job Lifecycle

```
Job Submitted
  ↓
Waiting (queued)
  ↓
Active (being processed)
  ↓
Success → Completed → Removed (after TTL)
  ↓
Failure → Failed (kept for debugging)
       → Retry with backoff
```

### Retry Strategy

Failed jobs are retried with exponential backoff:

1. **First retry**: 2 seconds
2. **Second retry**: 4 seconds
3. **Third retry**: 8 seconds
4. **Give up**: Job marked as failed

Failed jobs are kept in Redis for inspection and manual retry.

### Stalled Job Detection

Jobs that don't complete within `lockDuration` (30s) are marked stalled and retried if `maxStalledCount` > 0.

## Local Development

### Start Redis

#### Docker (Recommended)

```bash
docker run -d -p 6379:6379 redis:latest
```

#### Or install locally

```bash
# macOS
brew install redis
redis-server

# Ubuntu
sudo apt-get install redis-server
redis-server

# Windows
# Use Docker or WSL
```

### Verify Connection

```bash
redis-cli ping
# Should return: PONG
```

### Monitor Jobs in Real-time

```bash
# Install Bull CLI
npm install -g @bull-board/cli

# Run dashboard
bull-board redis://localhost:6379
# Open http://localhost:3000
```

## Production Deployment

### Redis Cluster (Recommended)

For production, use:

- AWS ElastiCache for Redis
- Redis Cloud
- Self-managed Redis cluster with replication

### Configuration

Update `.env` for production:

```env
REDIS_HOST=prod-redis.aws.com
REDIS_PORT=6379
REDIS_PASSWORD=<strong-password>
REDIS_DB=0
```

### Job Options for Production

```typescript
defaultJobOptions: {
  removeOnComplete: {
    age: 3600,  // Keep for 1 hour
  },
  removeOnFail: false,
  attempts: 5,  // More retries in production
  backoff: {
    type: 'exponential',
    delay: 2000,
  },
},
```

## Integration with Services

### Media Service

When uploading images:

```typescript
// Before: Blocks request while processing
const optimized = await this.mediaService.optimizeImage(buffer);

// After: Queue job and return immediately
await this.queueService.queueImageProcessing({ buffer, filename, userId });
return { status: 'processing' };
```

### Search Service

When creating/updating places:

```typescript
// Index in background
await this.queueService.queueSearchIndex({
  type: 'place',
  id: place.id,
  action: 'index',
  data: place,
});
```

### Places Service

In `places.service.ts`:

```typescript
async createPlace(createPlaceDto, userId, images) {
  // Create place record
  const place = await this.placesRepository.save({...});

  // Queue image processing
  for (const image of images) {
    await this.queueService.queueImageProcessing({
      buffer: image.buffer,
      filename: image.filename,
      userId,
      placeId: place.id,
    });
  }

  // Queue search indexing
  await this.queueService.queueSearchIndex({
    type: 'place',
    id: place.id,
    action: 'index',
    data: place,
  });

  // Return immediately
  return place;
}
```

## Debugging

### View Failed Jobs

```bash
redis-cli
> keys failed:*
> get failed:<job-id>
```

### Retry Failed Job

```typescript
// In queue processor
@OnWorkerEvent(WorkerEvents.FAILED)
onFailed(job: Job, error: Error) {
  this.logger.error(`Job ${job.id} failed:`, error.message);
  // Log to monitoring service
}
```

### Monitor Job Progress

```typescript
@Process()
async processImage(job: Job) {
  const total = 100;

  for (let i = 0; i < total; i++) {
    await job.progress(Math.round((i / total) * 100));
    // Do work...
  }
}
```

## Best Practices

### ✅ Do

- Use queues for long-running tasks (>1s)
- Set appropriate retry counts based on criticality
- Log job start and completion
- Monitor queue health regularly
- Clean up completed jobs
- Use job IDs for idempotency

### ❌ Don't

- Queue very large objects (>10MB per job)
- Use queues for real-time requirements (<100ms)
- Ignore failed jobs - they indicate issues
- Run without Redis backup/replication
- Set unlimited retries

## Monitoring

### Queue Metrics to Track

- Jobs per second (throughput)
- Failed job rate
- Average processing time
- Queue depth (waiting jobs)
- Worker utilization

### Example: Add to Prometheus

```typescript
// Export queue metrics
@Get('queue/metrics')
async getMetrics() {
  const stats = await this.queueService.getQueueStats();

  return {
    imageProcessing_waiting: stats.imageProcessing.waiting,
    imageProcessing_active: stats.imageProcessing.active,
    imageProcessing_failed: stats.imageProcessing.failed,
    // ... etc
  };
}
```

## Troubleshooting

### Jobs Not Processing

**Check 1:** Is Redis running?

```bash
redis-cli ping  # Should return PONG
```

**Check 2:** Are workers running?

```bash
# Ensure queue processors are registered in module
```

**Check 3:** Check logs

```
[QueueService] Image processing job queued: image-user123-1234567890
[ImageProcessingProcessor] Processing image job: image-user123-1234567890
```

### Memory Issues

If Redis memory grows:

```typescript
// Reduce job retention
defaultJobOptions: {
  removeOnComplete: {
    age: 300,  // Remove after 5 minutes
  },
}
```

### Duplicate Jobs

Ensure job IDs are unique:

```typescript
const job = await this.imageProcessingQueue.add(data, {
  jobId: `image-${userId}-${timestamp}-${randomId}`,
});
```

## Next Steps

1. Implement actual email sending in `EmailProcessor`
2. Add monitoring dashboard (Bull Board)
3. Set up Redis backup/replication
4. Add metrics to Prometheus
5. Implement job webhooks for real-time updates

## References

- [BullMQ Documentation](https://docs.bullmq.io/)
- [Redis Documentation](https://redis.io/documentation)
- [NestJS Bull Integration](https://docs.nestjs.com/techniques/task-scheduling)
