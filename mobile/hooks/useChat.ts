import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { chatAPI } from '../services/api';

export interface Participant {
  id: string;
  username: string;
  avatar_url: string | null;
}

export interface LastMessage {
  id: string;
  content: string;
  sender_id: string;
  is_read: boolean;
  created_at: string;
}

export interface ConversationSummary {
  id: string;
  created_at: string;
  updated_at: string;
  otherParticipant: Participant | null;
  lastMessage: LastMessage | null;
}

export interface ChatMessage {
  id: string;
  conversation_id: string;
  sender_id: string;
  content?: string | null;
  image_url?: string | null;
  is_read: boolean;
  created_at: string;
}

export interface MessagePagination {
  data: ChatMessage[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasMore: boolean;
  };
}

// Fetch all conversations for current user
export function useConversations() {
  return useQuery<ConversationSummary[]>({
    queryKey: ['conversations'],
    queryFn: async () => {
      const response = await chatAPI.getConversations();
      return response.data;
    },
  });
}

// Fetch message history for a conversation
export function useConversationMessages(conversationId: string | undefined) {
  return useQuery<MessagePagination>({
    queryKey: ['messages', conversationId],
    queryFn: async () => {
      const response = await chatAPI.getMessages(conversationId!);
      return response.data;
    },
    enabled: !!conversationId,
  });
}

// Mutation to send a message
export function useSendMessage(conversationId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (args: string | { content?: string; imageUrl?: string }) => {
      if (typeof args === 'string') {
        return chatAPI.sendMessage(conversationId, args);
      }
      return chatAPI.sendMessage(conversationId, args.content, args.imageUrl);
    },
    onSuccess: (response) => {
      // Optmistically update messages cache
      queryClient.setQueryData<MessagePagination>(
        ['messages', conversationId],
        (old) => {
          if (!old) return old;
          const exists = old.data.some((m) => m.id === response.data.id);
          if (exists) return old;
          return {
            ...old,
            data: [...old.data, response.data],
          };
        },
      );
      // Invalidate conversations list to update lastMessage and ordering
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
    },
  });
}

// Mutation to start or get a 1-to-1 conversation with a recipient user
export function useGetOrCreateConversation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (recipientId: string) =>
      chatAPI.getOrCreateConversation(recipientId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
    },
  });
}
