import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { JwtService } from '@nestjs/jwt';
import { Injectable } from '@nestjs/common';

@WebSocketGateway({
  cors: { origin: '*' },
  namespace: '/realtime',
  transports: ['websocket', 'polling'],
})
@Injectable()
export class RealtimeGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  private connectedUsers = new Map<string, string>(); // socketId -> userId
  private userSockets = new Map<string, Set<string>>(); // userId -> socketIds

  constructor(private jwtService: JwtService) {}

  async handleConnection(client: Socket) {
    try {
      const token =
        client.handshake.auth?.token ||
        client.handshake.headers?.authorization?.replace('Bearer ', '');
      if (token) {
        const payload = this.jwtService.verify(token);
        const userId = payload.sub;

        this.connectedUsers.set(client.id, userId);

        if (!this.userSockets.has(userId)) {
          this.userSockets.set(userId, new Set());
        }
        this.userSockets.get(userId)!.add(client.id);

        client.join(`user:${userId}`);
        client.emit('connected', {
          userId,
          message: 'Connected to realtime server',
        });
        console.log(`✅ User ${userId} connected`);
      }
    } catch (err) {
      console.log(`⚠️ Anonymous connection - ${err}`);
      client.emit('error', { message: 'Invalid token' });
    }
  }

  handleDisconnect(client: Socket) {
    const userId = this.connectedUsers.get(client.id);
    if (userId) {
      const sockets = this.userSockets.get(userId);
      if (sockets) {
        sockets.delete(client.id);
        if (sockets.size === 0) {
          this.userSockets.delete(userId);
        }
      }
      console.log(`❌ User ${userId} disconnected`);
    }
    this.connectedUsers.delete(client.id);
  }

  // ===== PLACE ROOMS =====

  @SubscribeMessage('joinPlace')
  handleJoinPlace(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { placeId: string },
  ) {
    if (!data?.placeId) {
      return { success: false, error: 'Missing placeId' };
    }
    client.join(`place:${data.placeId}`);
    this.server.to(`place:${data.placeId}`).emit('userJoined', {
      userId: this.connectedUsers.get(client.id),
      timestamp: new Date(),
    });
    return { success: true, placeId: data.placeId };
  }

  @SubscribeMessage('leavePlace')
  handleLeavePlace(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { placeId: string },
  ) {
    if (!data?.placeId) return { success: false };
    client.leave(`place:${data.placeId}`);
    return { success: true, placeId: data.placeId };
  }

  // ===== CHAT ROOMS =====

  @SubscribeMessage('joinConversation')
  handleJoinConversation(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { conversationId: string },
  ) {
    if (!data?.conversationId) {
      return { success: false, error: 'Missing conversationId' };
    }
    client.join(`conversation:${data.conversationId}`);
    return { success: true, conversationId: data.conversationId };
  }

  @SubscribeMessage('leaveConversation')
  handleLeaveConversation(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { conversationId: string },
  ) {
    if (!data?.conversationId) return { success: false };
    client.leave(`conversation:${data.conversationId}`);
    return { success: true, conversationId: data.conversationId };
  }

  // ===== EVENTS FROM BACKEND =====

  // Emit new message to conversation room and notify participants
  emitNewMessage(conversationId: string, message: any, participantIds: string[]) {
    this.server.to(`conversation:${conversationId}`).emit('newMessage', message);

    participantIds.forEach((userId) => {
      this.server.to(`user:${userId}`).emit('conversationUpdate', {
        conversationId,
        lastMessage: message,
      });
    });
  }

  // Emit new comment to all users viewing a place (real-time comments)
  emitNewComment(placeId: string, comment: any) {
    this.server.to(`place:${placeId}`).emit('newComment', {
      ...comment,
      timestamp: new Date(),
    });
  }

  // Emit comment deleted
  emitCommentDeleted(placeId: string, commentId: string) {
    this.server.to(`place:${placeId}`).emit('commentDeleted', { commentId });
  }

  // Emit new notification to a specific user (bell icon update)
  emitNotification(userId: string, notification: any) {
    this.server.to(`user:${userId}`).emit('notification', {
      ...notification,
      timestamp: new Date(),
    });
  }

  // Emit like update to place viewers (like count, liked status)
  emitLikeUpdate(
    placeId: string,
    data: { liked: boolean; like_count: number; userId: string },
  ) {
    this.server.to(`place:${placeId}`).emit('likeUpdate', {
      ...data,
      timestamp: new Date(),
    });
  }

  // Emit follow/unfollow update (for profile viewers)
  emitFollowUpdate(
    userId: string,
    data: { followerId: string; following: boolean; followers_count: number },
  ) {
    this.server.to(`user:${userId}`).emit('followUpdate', {
      ...data,
      timestamp: new Date(),
    });
  }

  // Emit user typing in comments
  @SubscribeMessage('userTyping')
  handleUserTyping(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { placeId: string },
  ) {
    const userId = this.connectedUsers.get(client.id);
    if (userId) {
      client.broadcast
        .to(`place:${data.placeId}`)
        .emit('userTyping', { userId });
    }
    return { success: true };
  }

  // Test connection
  @SubscribeMessage('ping')
  handlePing(@ConnectedSocket() client: Socket) {
    return { pong: true, timestamp: new Date() };
  }
}
