import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  RefreshControl,
} from 'react-native';
import { router } from 'expo-router';
import { useNotifications, useMarkAsRead } from '../../hooks/useNotifications';
import UserAvatar from '../../components/UserAvatar';
import LoadingScreen from '../../components/LoadingScreen';
import EmptyState from '../../components/EmptyState';
import { Colors, Spacing, BorderRadius, Fonts } from '../../constants/theme';

const typeConfig: Record<string, { icon: string; action: string }> = {
  like: { icon: '❤️', action: 'đã thích bài viết' },
  comment: { icon: '💬', action: 'đã bình luận về' },
  follow: { icon: '👤', action: 'đã theo dõi bạn' },
  reply: { icon: '↩️', action: 'đã trả lời bình luận của bạn tại' },
  chat: { icon: '✉️', action: 'đã gửi tin nhắn cho bạn' },
  message: { icon: '✉️', action: 'đã gửi tin nhắn cho bạn' },
};

export default function NotificationsScreen() {
  const [tab, setTab] = useState<'all' | 'unread'>('all');

  const {
    data: notifications,
    isLoading,
    refetch,
    isRefetching,
  } = useNotifications(tab === 'unread');

  const markAsReadMutation = useMarkAsRead();

  const unreadCount = Array.isArray(notifications) ? notifications.filter((n) => !n.is_read).length : 0;

  const getTimeAgo = (dateStr: string) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `${mins}p trước`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h trước`;
    const days = Math.floor(hours / 24);
    return `${days}d trước`;
  };

  const handlePress = (item: any) => {
    // Mark as read
    if (!item.is_read) {
      markAsReadMutation.mutate([item.id]);
    }

    if (item.type === 'chat' || item.type === 'message') {
      if (item.conversationId) {
        router.push(`/chat/${item.conversationId}`);
      } else if (item.conversation_id) {
        router.push(`/chat/${item.conversation_id}`);
      } else {
        router.push(`/chat`);
      }
    } else if (item.place) {
      router.push(`/place/${item.place.id}`);
    } else if (item.actor) {
      router.push(`/user/${item.actor.id}`);
    }
  };

  const handleMarkAllRead = () => {
    markAsReadMutation.mutate(undefined);
  };

  if (isLoading) {
    return <LoadingScreen message="Đang tải thông báo..." />;
  }

  const renderNotification = ({ item }: { item: any }) => {
    const config = typeConfig[item.type] || typeConfig.like;

    return (
      <TouchableOpacity
        style={[styles.notifItem, !item.is_read && styles.notifUnread]}
        onPress={() => handlePress(item)}
        activeOpacity={0.7}
      >
        <UserAvatar
          uri={item.actor.avatar_url}
          username={item.actor.username}
          size={44}
        />

        <View style={styles.notifContent}>
          <Text style={styles.notifText}>
            <Text style={styles.notifUsername}>@{item.actor.username}</Text>
            {' '}{config.action}
            {item.place && (
              <Text style={styles.notifPlaceTitle}> "{item.place.title}"</Text>
            )}
          </Text>
          <Text style={styles.notifTime}>{getTimeAgo(item.created_at)}</Text>
        </View>

        <Text style={styles.notifIcon}>{config.icon}</Text>

        {!item.is_read && <View style={styles.notifDot} />}
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      {/* Tabs */}
      <View style={styles.tabs}>
        <TouchableOpacity
          style={[styles.tab, tab === 'all' && styles.tabActive]}
          onPress={() => setTab('all')}
        >
          <Text style={[styles.tabText, tab === 'all' && styles.tabTextActive]}>
            Tất cả
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, tab === 'unread' && styles.tabActive]}
          onPress={() => setTab('unread')}
        >
          <Text style={[styles.tabText, tab === 'unread' && styles.tabTextActive]}>
            Chưa đọc {unreadCount > 0 && `(${unreadCount})`}
          </Text>
        </TouchableOpacity>
        {unreadCount > 0 && (
          <TouchableOpacity style={styles.markAllBtn} onPress={handleMarkAllRead}>
            <Text style={styles.markAllText}>Đọc tất cả</Text>
          </TouchableOpacity>
        )}
      </View>

      <FlatList
        data={Array.isArray(notifications) ? notifications : []}
        renderItem={renderNotification}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={refetch}
            tintColor={Colors.primary}
          />
        }
        ListEmptyComponent={
          <EmptyState
            icon="🔔"
            title="Chưa có thông báo"
            message="Các hoạt động sẽ xuất hiện ở đây"
          />
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  tabs: {
    flexDirection: 'row', borderBottomWidth: 0.5,
    borderBottomColor: Colors.surfaceBorder, paddingHorizontal: Spacing.base,
    alignItems: 'center',
  },
  tab: { paddingVertical: Spacing.md, paddingHorizontal: Spacing.lg, marginRight: Spacing.sm },
  tabActive: { borderBottomWidth: 2, borderBottomColor: Colors.primary },
  tabText: { color: Colors.textMuted, fontSize: Fonts.sizes.md, fontWeight: '500' },
  tabTextActive: { color: Colors.primary, fontWeight: '700' },
  markAllBtn: { marginLeft: 'auto', paddingVertical: Spacing.sm },
  markAllText: { color: Colors.primary, fontSize: Fonts.sizes.sm, fontWeight: '600' },
  list: { paddingBottom: 100 },
  notifItem: {
    flexDirection: 'row', alignItems: 'center', paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.base, borderBottomWidth: 0.5,
    borderBottomColor: Colors.surfaceBorder, position: 'relative',
  },
  notifUnread: { backgroundColor: 'rgba(108, 99, 255, 0.05)' },
  notifContent: { flex: 1, marginLeft: Spacing.md, marginRight: Spacing.sm },
  notifText: { color: Colors.textSecondary, fontSize: Fonts.sizes.md, lineHeight: 20 },
  notifUsername: { color: Colors.textPrimary, fontWeight: '700' },
  notifPlaceTitle: { color: Colors.primary, fontWeight: '600' },
  notifTime: { color: Colors.textMuted, fontSize: Fonts.sizes.xs, marginTop: 4 },
  notifIcon: { fontSize: 20 },
  notifDot: {
    position: 'absolute', top: Spacing.md, right: Spacing.base,
    width: 8, height: 8, borderRadius: 4, backgroundColor: Colors.primary,
  },
});
