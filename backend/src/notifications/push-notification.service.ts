import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import admin from 'firebase-admin';
import { Repository } from 'typeorm';
import { User } from '../users/entities/user.entity';

@Injectable()
export class PushNotificationService {
  private readonly logger = new Logger(PushNotificationService.name);
  private firebaseApp: admin.app.App;

  constructor(
    private configService: ConfigService,
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {
    this.initializeFirebase();
  }

  private initializeFirebase() {
    try {
      const serviceAccountPath = this.configService.get(
        'FIREBASE_SERVICE_ACCOUNT_PATH',
      );

      if (!serviceAccountPath || serviceAccountPath.includes('${{')) {
        this.logger.warn(
          'FIREBASE_SERVICE_ACCOUNT_PATH not configured. Push notifications disabled.',
        );
        return;
      }

      try {
        const serviceAccount = require(serviceAccountPath);

        this.firebaseApp = admin.initializeApp({
          credential: admin.credential.cert(serviceAccount),
        });

        this.logger.log('Firebase initialized successfully');
      } catch (fileError) {
        this.logger.warn(
          `Firebase service account file not found at ${serviceAccountPath}. Push notifications disabled.`,
        );
      }
    } catch (error) {
      this.logger.error('Failed to initialize Firebase:', error);
    }
  }

  /**
   * Send notification to a single device
   */
  async sendToDevice(
    deviceToken: string,
    title: string,
    body: string,
    data?: Record<string, string>,
  ): Promise<boolean> {
    if (deviceToken.startsWith('ExponentPushToken[')) {
      return this.sendToExpoDevice(deviceToken, title, body, data);
    }

    if (!this.firebaseApp) {
      this.logger.warn('Firebase not initialized. Cannot send notification.');
      return false;
    }

    try {
      const message: admin.messaging.Message = {
        token: deviceToken,
        notification: {
          title,
          body,
        },
        data: {
          ...data,
          timestamp: new Date().toISOString(),
        },
        android: {
          priority: 'high',
          ttl: 86400, // 24 hours
        },
        apns: {
          headers: {
            'apns-priority': '10', // High priority
          },
          payload: {
            aps: {
              alert: {
                title,
                body,
              },
              sound: 'default',
              badge: 1,
            },
          },
        },
      };

      const response = await admin.messaging().send(message);
      this.logger.log(`Notification sent successfully: ${response}`);
      return true;
    } catch (error) {
      this.logger.error(
        `Failed to send notification to ${deviceToken}:`,
        error,
      );
      return false;
    }
  }

  private async sendToExpoDevice(
    deviceToken: string,
    title: string,
    body: string,
    data?: Record<string, string>,
  ): Promise<boolean> {
    try {
      const response = await fetch('https://exp.host/--/api/v2/push/send', {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Accept-Encoding': 'gzip, deflate',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          to: deviceToken,
          title,
          body,
          data: {
            ...data,
            timestamp: new Date().toISOString(),
          },
        }),
      });

      if (!response.ok) {
        this.logger.error(`Expo push failed with status ${response.status}`);
        return false;
      }

      return true;
    } catch (error) {
      this.logger.error(`Failed to send Expo push to ${deviceToken}:`, error);
      return false;
    }
  }

  private async sendToUserDevice(
    userId: string,
    title: string,
    body: string,
    data?: Record<string, string>,
  ): Promise<boolean> {
    const user = await this.usersRepository.findOne({ where: { id: userId } });
    if (!user?.device_token || !user.push_notifications_enabled) {
      return false;
    }

    return this.sendToDevice(user.device_token, title, body, data);
  }

  /**
   * Send notification to multiple devices
   */
  async sendToMultipleDevices(
    deviceTokens: string[],
    title: string,
    body: string,
    data?: Record<string, string>,
  ): Promise<{ successCount: number; failureCount: number }> {
    if (!this.firebaseApp) {
      this.logger.warn('Firebase not initialized. Cannot send notifications.');
      return { successCount: 0, failureCount: deviceTokens.length };
    }

    if (deviceTokens.length === 0) {
      return { successCount: 0, failureCount: 0 };
    }

    try {
      const message: admin.messaging.MulticastMessage = {
        tokens: deviceTokens,
        notification: {
          title,
          body,
        },
        data: {
          ...data,
          timestamp: new Date().toISOString(),
        },
        android: {
          priority: 'high',
        },
        apns: {
          headers: {
            'apns-priority': '10',
          },
        },
      };

      const response = await admin.messaging().sendMulticast(message);
      this.logger.log(
        `Sent to ${response.successCount} devices, ${response.failureCount} failed`,
      );
      return {
        successCount: response.successCount,
        failureCount: response.failureCount,
      };
    } catch (error) {
      this.logger.error('Failed to send multicast notification:', error);
      return {
        successCount: 0,
        failureCount: deviceTokens.length,
      };
    }
  }

  /**
   * Send notification to all users with a specific topic
   */
  async sendToTopic(
    topic: string,
    title: string,
    body: string,
    data?: Record<string, string>,
  ): Promise<boolean> {
    if (!this.firebaseApp) {
      this.logger.warn('Firebase not initialized. Cannot send notification.');
      return false;
    }

    try {
      const message: admin.messaging.Message = {
        topic,
        notification: {
          title,
          body,
        },
        data: {
          ...data,
          timestamp: new Date().toISOString(),
        },
      };

      const response = await admin.messaging().send(message);
      this.logger.log(`Topic message sent successfully: ${response}`);
      return true;
    } catch (error) {
      this.logger.error(
        `Failed to send topic notification to ${topic}:`,
        error,
      );
      return false;
    }
  }

  /**
   * Subscribe device to a topic
   */
  async subscribeToTopic(deviceToken: string, topic: string): Promise<boolean> {
    if (!this.firebaseApp) {
      this.logger.warn('Firebase not initialized. Cannot subscribe to topic.');
      return false;
    }

    try {
      await admin.messaging().subscribeToTopic(deviceToken, topic);
      this.logger.log(`Device ${deviceToken} subscribed to topic ${topic}`);
      return true;
    } catch (error) {
      this.logger.error(`Failed to subscribe to topic:`, error);
      return false;
    }
  }

  /**
   * Unsubscribe device from a topic
   */
  async unsubscribeFromTopic(
    deviceToken: string,
    topic: string,
  ): Promise<boolean> {
    if (!this.firebaseApp) {
      this.logger.warn(
        'Firebase not initialized. Cannot unsubscribe from topic.',
      );
      return false;
    }

    try {
      await admin.messaging().unsubscribeFromTopic(deviceToken, topic);
      this.logger.log(`Device ${deviceToken} unsubscribed from topic ${topic}`);
      return true;
    } catch (error) {
      this.logger.error(`Failed to unsubscribe from topic:`, error);
      return false;
    }
  }

  /**
   * Broadcast notification to all followers of a user
   */
  async notifyFollowers(
    userId: string,
    title: string,
    body: string,
    data?: Record<string, string>,
  ): Promise<boolean> {
    // Use topic-based messaging to notify all followers
    const topicName = `followers-${userId}`;
    return this.sendToTopic(topicName, title, body, data);
  }

  /**
   * Notify user about a new comment on their place
   */
  async notifyNewComment(
    userId: string,
    placeTitle: string,
    commenterUsername: string,
    commentText: string,
    placeId: string,
  ): Promise<boolean> {
    return this.sendToUserDevice(
      userId,
      '💬 Bình luận mới',
      `${commenterUsername}: "${commentText.substring(0, 50)}..."`,
      {
        type: 'comment',
        placeId,
        userId,
      },
    );
  }

  /**
   * Notify user about a new like on their place
   */
  async notifyNewLike(
    userId: string,
    placeTitle: string,
    placeId: string,
  ): Promise<boolean> {
    return this.sendToUserDevice(
      userId,
      '❤️ Ai đó đã thích bài của bạn',
      `"${placeTitle}" vừa nhận được 1 lượt thích`,
      {
        type: 'like',
        placeId,
        userId,
      },
    );
  }

  /**
   * Notify user about a new follower
   */
  async notifyNewFollower(
    userId: string,
    followerUsername: string,
  ): Promise<boolean> {
    return this.sendToUserDevice(
      userId,
      '👤 Người theo dõi mới',
      `${followerUsername} bắt đầu theo dõi bạn`,
      {
        type: 'follow',
        userId,
      },
    );
  }

  /**
   * Notify user about a mention in a comment or post
   */
  async notifyMention(
    userId: string,
    mentionerUsername: string,
    mentionContext: string,
    contextId: string,
    mentionType: 'comment' | 'post' = 'comment',
  ): Promise<boolean> {
    const typeEmoji = mentionType === 'comment' ? '💬' : '📝';
    const typeText = mentionType === 'comment' ? 'bình luận' : 'bài viết';

    return this.sendToUserDevice(
      userId,
      `${typeEmoji} @${mentionerUsername} đã nhắc đến bạn`,
      `"${mentionContext.substring(0, 40)}..." trong một ${typeText}`,
      {
        type: 'mention',
        mentionType,
        contextId,
        userId,
        mentionerUsername,
      },
    );
  }
}
