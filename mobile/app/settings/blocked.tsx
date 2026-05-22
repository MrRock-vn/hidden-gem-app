import React from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useBlockedUsers, useBlockUser } from '../../hooks/useUser';
import { useThemeStore } from '../../stores/themeStore';
import { Colors, Spacing, BorderRadius, Fonts } from '../../constants/theme';
import UserAvatar from '../../components/UserAvatar';

export default function BlockedUsersScreen() {
  const router = useRouter();
  const { isDark, colors } = useThemeStore();
  const { data: blockedUsers, isLoading } = useBlockedUsers();
  const blockMutation = useBlockUser();

  const handleUnblock = (userId: string, username: string) => {
    Alert.alert(
      'Bỏ chặn người dùng',
      `Bạn có chắc chắn muốn bỏ chặn @${username}? Họ sẽ lại có thể theo dõi bạn và tìm thấy các bài viết của bạn.`,
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Bỏ chặn',
          style: 'destructive',
          onPress: async () => {
            try {
              await blockMutation.mutateAsync(userId);
            } catch (error) {
              Alert.alert('Lỗi', 'Không thể thực hiện hành động này lúc này.');
            }
          },
        },
      ]
    );
  };

  if (isLoading) {
    return (
      <View style={[styles.center, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {blockedUsers && blockedUsers.length > 0 ? (
        <FlatList
          data={blockedUsers}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
          renderItem={({ item }) => (
            <View style={[styles.userCard, { backgroundColor: colors.backgroundCard, borderColor: colors.surfaceBorder }]}>
              <View style={styles.userInfo}>
                <UserAvatar uri={item.avatar_url} username={item.username} size={48} />
                <View style={styles.textContainer}>
                  <Text style={[styles.username, { color: colors.textPrimary }]}>@{item.username}</Text>
                  {item.bio ? (
                    <Text style={[styles.bio, { color: colors.textMuted }]} numberOfLines={1}>
                      {item.bio}
                    </Text>
                  ) : null}
                </View>
              </View>
              <TouchableOpacity
                style={[styles.unblockButton, { borderColor: colors.error }]}
                onPress={() => handleUnblock(item.id, item.username)}
                disabled={blockMutation.isPending}
              >
                <Text style={[styles.unblockText, { color: colors.error }]}>Bỏ chặn</Text>
              </TouchableOpacity>
            </View>
          )}
        />
      ) : (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyIcon}>🚫</Text>
          <Text style={[styles.emptyTitle, { color: colors.textPrimary }]}>Danh sách chặn trống</Text>
          <Text style={[styles.emptySubtitle, { color: colors.textMuted }]}>
            Những người bạn chặn sẽ xuất hiện ở đây. Khi bạn chặn ai đó, họ sẽ không thể xem hồ sơ hoặc các địa điểm của bạn.
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: Spacing.base,
    paddingTop: Spacing.base,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContent: {
    paddingBottom: 40,
    gap: Spacing.sm,
  },
  userCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    borderWidth: 0.5,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: Spacing.md,
  },
  textContainer: {
    flex: 1,
  },
  username: {
    fontSize: Fonts.sizes.base,
    fontWeight: '600',
  },
  bio: {
    fontSize: Fonts.sizes.sm,
    marginTop: 2,
  },
  unblockButton: {
    borderWidth: 1,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    marginLeft: Spacing.md,
  },
  unblockText: {
    fontSize: Fonts.sizes.sm,
    fontWeight: '600',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Spacing.xl,
    paddingBottom: 80,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: Spacing.base,
    opacity: 0.8,
  },
  emptyTitle: {
    fontSize: Fonts.sizes.lg,
    fontWeight: '700',
    marginBottom: Spacing.xs,
  },
  emptySubtitle: {
    fontSize: Fonts.sizes.md,
    textAlign: 'center',
    lineHeight: 20,
  },
});
