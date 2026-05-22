import React, { useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useQueryClient } from '@tanstack/react-query';
import { useConversations } from '../../hooks/useChat';
import { useAuthStore } from '../../stores/authStore';
import { socketService } from '../../services/socket';
import UserAvatar from '../../components/UserAvatar';
import { Colors, Spacing, BorderRadius, Fonts } from '../../constants/theme';

export default function ChatListScreen() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const currentUser = useAuthStore((state) => state.user);
  const { data: conversations, isLoading, refetch } = useConversations();

  useEffect(() => {
    let mounted = true;

    const setupSocket = async () => {
      await socketService.connect();
      if (!mounted) return;

      const handleUpdate = () => {
        queryClient.invalidateQueries({ queryKey: ['conversations'] });
      };
      socketService.onConversationUpdate(handleUpdate);
    };

    setupSocket();

    return () => {
      mounted = false;
      socketService.offConversationUpdate();
    };
  }, [queryClient]);

  const renderItem = ({ item }: { item: any }) => {
    const partner = item.otherParticipant;
    if (!partner) return null;

    const lastMsg = item.lastMessage;
    const isUnread =
      lastMsg && !lastMsg.is_read && lastMsg.sender_id !== currentUser?.id;

    // Format time
    const timeString = lastMsg
      ? new Date(lastMsg.created_at).toLocaleTimeString('vi-VN', {
          hour: '2-digit',
          minute: '2-digit',
        })
      : '';

    return (
      <TouchableOpacity
        style={styles.itemContainer}
        onPress={() => router.push(`/chat/${item.id}` as any)}
      >
        <UserAvatar uri={partner.avatar_url} username={partner.username} size={50} />
        <View style={styles.contentContainer}>
          <View style={styles.headerRow}>
            <Text style={[styles.username, isUnread && styles.unreadText]}>
              {partner.username}
            </Text>
            <Text style={styles.timeText}>{timeString}</Text>
          </View>
          <View style={styles.messageRow}>
            <Text
              style={[
                styles.lastMessage,
                isUnread && styles.unreadMessage,
              ]}
              numberOfLines={1}
            >
              {lastMsg
                ? lastMsg.sender_id === currentUser?.id
                  ? `Bạn: ${lastMsg.content}`
                  : lastMsg.content
                : 'Chưa có tin nhắn nào'}
            </Text>
            {isUnread && <View style={styles.unreadBadge} />}
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={conversations}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        refreshing={isLoading}
        onRefresh={refetch}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>Chưa có cuộc trò chuyện nào.</Text>
            <Text style={styles.emptySubText}>
              Hãy tìm bạn bè và nhắn tin để bắt đầu kết nối!
            </Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.background,
  },
  listContent: {
    paddingVertical: Spacing.sm,
  },
  itemContainer: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.md,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  contentContainer: {
    flex: 1,
    marginLeft: Spacing.md,
    justifyContent: 'center',
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.xs,
  },
  username: {
    fontSize: Fonts.sizes.base,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  unreadText: {
    fontWeight: '800',
  },
  timeText: {
    fontSize: Fonts.sizes.sm,
    color: Colors.textMuted,
  },
  messageRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  lastMessage: {
    fontSize: Fonts.sizes.md,
    color: Colors.textSecondary,
    flex: 1,
    marginRight: Spacing.sm,
  },
  unreadMessage: {
    color: Colors.textPrimary,
    fontWeight: '700',
  },
  unreadBadge: {
    width: 10,
    height: 10,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.primary,
  },
  emptyContainer: {
    padding: Spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 100,
  },
  emptyText: {
    fontSize: Fonts.sizes.lg,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginBottom: Spacing.sm,
  },
  emptySubText: {
    fontSize: Fonts.sizes.md,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
});
