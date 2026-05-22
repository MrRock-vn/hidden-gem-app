import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, FlatList, RefreshControl } from 'react-native';
import { router } from 'expo-router';
import { useFollowing, useFollowers, useToggleFollow } from '../../hooks/useSocial';
import { useAuthStore } from '../../stores/authStore';
import UserAvatar from '../../components/UserAvatar';
import LoadingScreen from '../../components/LoadingScreen';
import EmptyState from '../../components/EmptyState';
import { Colors, Spacing, BorderRadius, Fonts } from '../../constants/theme';

export default function FollowingScreen() {
  const [tab, setTab] = useState<'following' | 'followers'>('following');
  const { user } = useAuthStore();
  const userId = user?.id || 'me';

  const {
    data: followingData,
    isLoading: followingLoading,
    refetch: refetchFollowing,
    isRefetching: refetchingFollowing,
  } = useFollowing(userId);

  const {
    data: followersData,
    isLoading: followersLoading,
    refetch: refetchFollowers,
    isRefetching: refetchingFollowers,
  } = useFollowers(userId);

  const toggleFollowMutation = useToggleFollow();

  const users = tab === 'following' ? followingData : followersData;
  const isLoading = tab === 'following' ? followingLoading : followersLoading;
  const isRefetching = tab === 'following' ? refetchingFollowing : refetchingFollowers;
  const doRefetch = tab === 'following' ? refetchFollowing : refetchFollowers;

  const handleToggleFollow = (targetUserId: string, isFollowing: boolean) => {
    toggleFollowMutation.mutate({ userId: targetUserId, isFollowing });
  };

  if (isLoading) {
    return <LoadingScreen message="Đang tải..." />;
  }

  return (
    <View style={styles.container}>
      <View style={styles.tabs}>
        <TouchableOpacity style={[styles.tab, tab === 'following' && styles.tabActive]} onPress={() => setTab('following')}>
          <Text style={[styles.tabText, tab === 'following' && styles.tabTextActive]}>Đang theo dõi</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.tab, tab === 'followers' && styles.tabActive]} onPress={() => setTab('followers')}>
          <Text style={[styles.tabText, tab === 'followers' && styles.tabTextActive]}>Người theo dõi</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={users || []}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={doRefetch}
            tintColor={Colors.primary}
          />
        }
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.userItem} onPress={() => router.push(`/user/${item.id}`)}>
            <UserAvatar uri={item.avatar_url} username={item.username} size={44} />
            <View style={styles.userInfo}>
              <Text style={styles.username}>@{item.username}</Text>
              <Text style={styles.userBio} numberOfLines={1}>{item.bio}</Text>
            </View>
            <TouchableOpacity
              style={[styles.followBtn, item.is_following && styles.followBtnActive]}
              onPress={() => handleToggleFollow(item.id, item.is_following)}
            >
              <Text style={[styles.followBtnText, item.is_following && styles.followBtnTextActive]}>
                {item.is_following ? 'Đang theo dõi' : 'Theo dõi'}
              </Text>
            </TouchableOpacity>
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          <EmptyState
            icon="👥"
            title={tab === 'following' ? 'Chưa theo dõi ai' : 'Chưa có người theo dõi'}
            message="Hãy khám phá và kết nối với cộng đồng!"
          />
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  tabs: { flexDirection: 'row', borderBottomWidth: 0.5, borderBottomColor: Colors.surfaceBorder },
  tab: { flex: 1, paddingVertical: Spacing.md, alignItems: 'center' },
  tabActive: { borderBottomWidth: 2, borderBottomColor: Colors.primary },
  tabText: { color: Colors.textMuted, fontSize: Fonts.sizes.md },
  tabTextActive: { color: Colors.primary, fontWeight: '700' },
  list: { padding: Spacing.base },
  userItem: {
    flexDirection: 'row', alignItems: 'center', paddingVertical: Spacing.md,
    borderBottomWidth: 0.5, borderBottomColor: Colors.surfaceBorder,
  },
  userInfo: { flex: 1, marginLeft: Spacing.md },
  username: { color: Colors.textPrimary, fontWeight: '600', fontSize: Fonts.sizes.md },
  userBio: { color: Colors.textMuted, fontSize: Fonts.sizes.sm, marginTop: 2 },
  followBtn: {
    paddingHorizontal: Spacing.base, paddingVertical: 6,
    borderRadius: BorderRadius.full, backgroundColor: Colors.primary,
  },
  followBtnActive: {
    backgroundColor: 'transparent', borderWidth: 1, borderColor: Colors.surfaceBorder,
  },
  followBtnText: { color: Colors.white, fontWeight: '600', fontSize: Fonts.sizes.sm },
  followBtnTextActive: { color: Colors.textSecondary },
});
