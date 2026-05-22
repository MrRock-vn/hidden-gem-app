import { io, Socket } from 'socket.io-client';
import * as SecureStore from 'expo-secure-store';
import { API_URL } from '../constants/theme';

class SocketService {
  private socket: Socket | null = null;

  async connect() {
    if (this.socket?.connected) return this.socket;

    const token = await SecureStore.getItemAsync('accessToken');
    if (!token) return null;

    const serverUrl = API_URL.replace('/api', '');

    this.socket = io(serverUrl + '/realtime', {
      auth: { token },
      transports: ['websocket', 'polling'],
      autoConnect: true,
      reconnection: true,
    });

    this.socket.on('connect', () => {
      console.log('🔌 Connected to realtime gateway');
    });

    this.socket.on('disconnect', (reason) => {
      console.log('🔌 Disconnected from realtime gateway:', reason);
    });

    return this.socket;
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  getSocket() {
    return this.socket;
  }

  joinConversation(conversationId: string) {
    if (this.socket) {
      this.socket.emit('joinConversation', { conversationId });
    }
  }

  leaveConversation(conversationId: string) {
    if (this.socket) {
      this.socket.emit('leaveConversation', { conversationId });
    }
  }

  onNewMessage(callback: (message: any) => void) {
    if (this.socket) {
      this.socket.on('newMessage', callback);
    }
  }

  offNewMessage() {
    if (this.socket) {
      this.socket.off('newMessage');
    }
  }

  onConversationUpdate(callback: (data: any) => void) {
    if (this.socket) {
      this.socket.on('conversationUpdate', callback);
    }
  }

  offConversationUpdate() {
    if (this.socket) {
      this.socket.off('conversationUpdate');
    }
  }
}

export const socketService = new SocketService();
export type { Socket };
