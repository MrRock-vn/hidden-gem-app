import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Conversation } from './entities/conversation.entity';
import { Message } from './entities/message.entity';
import { User } from '../users/entities/user.entity';
import { RealtimeGateway } from '../realtime/realtime.gateway';
import { PushNotificationService } from '../notifications/push-notification.service';

@Injectable()
export class ChatService {
  constructor(
    @InjectRepository(Conversation)
    private conversationRepository: Repository<Conversation>,
    @InjectRepository(Message)
    private messageRepository: Repository<Message>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private realtimeGateway: RealtimeGateway,
    private pushNotificationService: PushNotificationService,
  ) {}

  async getOrCreateConversation(userId: string, recipientId: string): Promise<Conversation> {
    if (userId === recipientId) {
      throw new ForbiddenException('Không thể trò chuyện với chính mình');
    }

    const recipient = await this.userRepository.findOne({ where: { id: recipientId } });
    if (!recipient) {
      throw new NotFoundException('Không tìm thấy người dùng nhận');
    }

    // Find if a 1-to-1 conversation already exists between these two users
    const conversations = await this.conversationRepository
      .createQueryBuilder('conversation')
      .innerJoinAndSelect('conversation.participants', 'participant')
      .where('conversation.id IN (SELECT conversation_id FROM conversation_participants WHERE user_id = :userId)', { userId })
      .andWhere('conversation.id IN (SELECT conversation_id FROM conversation_participants WHERE user_id = :recipientId)', { recipientId })
      .getMany();

    const exactConversation = conversations.find(c => c.participants.length === 2);

    if (exactConversation) {
      return exactConversation;
    }

    // Otherwise, create a new conversation
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('Không tìm thấy người dùng hiện tại');
    }

    const newConversation = this.conversationRepository.create({
      participants: [user, recipient],
    });

    return this.conversationRepository.save(newConversation);
  }

  async getConversations(userId: string): Promise<any[]> {
    const conversations = await this.conversationRepository
      .createQueryBuilder('conversation')
      .innerJoin('conversation.participants', 'participant')
      .where('participant.id = :userId', { userId })
      .leftJoinAndSelect('conversation.participants', 'allParticipants')
      .getMany();

    const result = await Promise.all(
      conversations.map(async (conv) => {
        const lastMessage = await this.messageRepository.findOne({
          where: { conversation_id: conv.id },
          order: { created_at: 'DESC' },
          relations: ['sender'],
        });

        const otherParticipant = conv.participants.find((p) => p.id !== userId);

        return {
          id: conv.id,
          created_at: conv.created_at,
          updated_at: conv.updated_at,
          otherParticipant: otherParticipant
            ? {
                id: otherParticipant.id,
                username: otherParticipant.username,
                avatar_url: otherParticipant.avatar_url,
              }
            : null,
          lastMessage: lastMessage
            ? {
                id: lastMessage.id,
                content: lastMessage.content,
                sender_id: lastMessage.sender_id,
                is_read: lastMessage.is_read,
                created_at: lastMessage.created_at,
              }
            : null,
        };
      }),
    );

    // Sort by latest activity (updated_at)
    return result.sort((a, b) => {
      const aTime = a.updated_at ? a.updated_at.getTime() : 0;
      const bTime = b.updated_at ? b.updated_at.getTime() : 0;
      return bTime - aTime;
    });
  }

  async getMessages(
    conversationId: string,
    userId: string,
    page: number = 1,
    limit: number = 20,
  ): Promise<any> {
    const conversation = await this.conversationRepository.findOne({
      where: { id: conversationId },
      relations: ['participants'],
    });

    if (!conversation) {
      throw new NotFoundException('Không tìm thấy cuộc hội thoại');
    }

    const isParticipant = conversation.participants.some((p) => p.id === userId);
    if (!isParticipant) {
      throw new ForbiddenException('Bạn không phải là thành viên của cuộc hội thoại này');
    }

    const [messages, total] = await this.messageRepository.findAndCount({
      where: { conversation_id: conversationId },
      order: { created_at: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    // Mark other's messages in this conversation as read
    await this.messageRepository
      .createQueryBuilder()
      .update(Message)
      .set({ is_read: true })
      .where('conversation_id = :conversationId AND sender_id != :userId AND is_read = :isRead', {
        conversationId,
        userId,
        isRead: false,
      })
      .execute();

    return {
      data: messages.reverse(),
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasMore: page * limit < total,
      },
    };
  }

  async sendMessage(
    senderId: string,
    conversationId: string,
    content?: string,
    imageUrl?: string,
  ): Promise<Message> {
    const conversation = await this.conversationRepository.findOne({
      where: { id: conversationId },
      relations: ['participants'],
    });

    if (!conversation) {
      throw new NotFoundException('Không tìm thấy cuộc hội thoại');
    }

    const isParticipant = conversation.participants.some((p) => p.id === senderId);
    if (!isParticipant) {
      throw new ForbiddenException('Bạn không phải là thành viên của cuộc hội thoại này');
    }

    const message = this.messageRepository.create({
      conversation_id: conversationId,
      sender_id: senderId,
      content,
      image_url: imageUrl,
    });

    const savedMessage = await this.messageRepository.save(message);

    // Update conversation updated_at
    conversation.updated_at = new Date();
    await this.conversationRepository.save(conversation);

    // Broadcast to WebSocket clients
    const participantIds = conversation.participants.map((p) => p.id);
    this.realtimeGateway.emitNewMessage(conversationId, savedMessage, participantIds);

    // Send push notifications to other participants
    const sender = conversation.participants.find((p) => p.id === senderId);
    const recipients = conversation.participants.filter((p) => p.id !== senderId);

    for (const recipient of recipients) {
      if (recipient.device_token && recipient.push_notifications_enabled) {
        try {
          const title = sender ? `@${sender.username}` : 'Tin nhắn mới';
          const body = content
            ? content
            : imageUrl
            ? '📷 Đã gửi một ảnh'
            : 'Đã gửi một tin nhắn';

          await this.pushNotificationService.sendToDevice(
            recipient.device_token,
            title,
            body,
            {
              type: 'chat',
              conversationId,
              senderId,
            },
          );
        } catch (err) {
          console.error('[ChatService] Failed to send push notification:', err);
        }
      }
    }

    return savedMessage;
  }
}
