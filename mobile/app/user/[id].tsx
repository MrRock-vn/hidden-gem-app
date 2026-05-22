import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Dimensions, Alert, Image } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { useUserProfile, useBlockUser } from '../../hooks/useUser';
import { useUserPlaces } from '../../hooks/usePlaces';
import { useToggleFollow } from '../../hooks/useSocial';
import { useGetOrCreateConversation } from '../../hooks/useChat';
import UserAvatar from '../../components/UserAvatar';
import LoadingScreen from '../../components/LoadingScreen';
import { Colors, Spacing, BorderRadius, Fonts, Categories } from '../../constants/theme';
import { getMediaUrl } from '../../utils/media';

const { width } = Dimensions.get('window');
const GRID_SIZE = (width - Spacing.base * 3) / 2;

const categoryColors: Record<string, string> = {
  cafe: '#C07F00', food: '#E74C3C', photo: '#9B59B6', nature: '#27AE60',
  art: '#F39C12', nightlife: '#2C3E50',
};

export default function UserProfileScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data: profile, isLoading } = useUserProfile(id);
  const { data: userPosts } = useUserPlaces(id);
  const toggleFollowMutation = useToggleFollow();
  const blockMutation = useBlockUser();
  const getOrCreateConvMutation = useGetOrCreateConversation();

  if (isLoading || !profile) {
    return <LoadingScreen message="Đang tải hồ sơ..." />;
  }

  const posts = userPosts || [];

  const handleToggleFollow = () => {
    toggleFollowMutation.mutate({
      userId: profile.id!,
      isFollowing: profile.is_following,
    });
  };

  const handleMore = () => {
    const isCurrentlyBlocked = (profile as any).is_blocked;
    Alert.alert(
      'Tùy chọn',
      '',
      [
        {
          text: isCurrentlyBlocked ? 'Bỏ chặn người dùng' : 'Chặn người dùng',
          style: 'destructive',
          onPress: async () => {
            try {
              await blockMutation.mutateAsync(profile.id!);
              Alert.alert(
                'Thành công',
                isCurrentlyBlocked ? 'Đã bỏ chặn người dùng.' : 'Đã chặn người dùng thành công.'
              );
            } catch (error) {
              Alert.alert('Lỗi', 'Không thể thực hiện hành động này lúc này.');
            }
          },
        },
        { text: 'Báo cáo', onPress: () => Alert.alert('Báo cáo', 'Đã gửi báo cáo thành công.') },
        { text: 'Hủy', style: 'cancel' },
      ],
    );
  };

  const handleMessage = async () => {
    if (!profile?.id) return;
    try {
      const response = await getOrCreateConvMutation.mutateAsync(profile.id);
      const conversation = response.data;
      router.push(`/chat/${conversation.id}` as any);
    } catch (error) {
      Alert.alert('Lỗi', 'Không thể bắt đầu trò chuyện với người dùng này.');
    }
  };

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>@{profile.username}</Text>
        <TouchableOpacity onPress={handleMore}>
          <Text style={styles.moreIcon}>⋯</Text>
        </TouchableOpacity>
      </View>

      {/* Profile Info */}
      <View style={styles.profileSection}>
        <UserAvatar
          uri={profile.avatar_url}
          username={profile.username}
          size={80}
          color={Colors.accent}
        />

        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{(profile as any).posts_count ?? posts.length}</Text>
            <Text style={styles.statLabel}>Bài đăng</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{(profile as any).followers_count || 0}</Text>
            <Text style={styles.statLabel}>Follower</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{(profile as any).following_count || 0}</Text>
            <Text style={styles.statLabel}>Following</Text>
          </View>
        </View>

        {profile.bio && <Text style={styles.bio}>{profile.bio}</Text>}
        {profile.city && <Text style={styles.city}>📍 {profile.city}</Text>}

        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={[styles.followBtn, profile.is_following && styles.followBtnActive]}
            onPress={handleToggleFollow}
          >
            <Text style={[styles.followBtnText, profile.is_following && styles.followBtnTextActive]}>
              {profile.is_following ? 'Đang theo dõi' : 'Theo dõi'}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.messageBtn}
            onPress={handleMessage}
            disabled={getOrCreateConvMutation.isPending}
          >
            <Text style={styles.messageBtnText}>💬</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Posts Grid */}
      <View style={styles.postsGrid}>
        {posts.length === 0 ? (
          <View style={styles.emptyPosts}>
            <Text style={styles.emptyIcon}>📍</Text>
            <Text style={styles.emptyText}>Chưa có bài đăng</Text>
          </View>
        ) : (
          posts.map((post) => {
            const imageUrl = getMediaUrl(post.images?.[0]?.url);

            return (
              <TouchableOpacity key={post.id}
                style={[styles.postCard, { backgroundColor: categoryColors[post.category] || Colors.surfaceLight }]}
                onPress={() => router.push(`/place/${post.id}`)}
              >
                {imageUrl ? (
                  <Image source={{ uri: imageUrl }} style={styles.postImage} resizeMode="cover" />
                ) : (
                  <Text style={styles.postEmoji}>{Categories.find((c) => c.id === post.category)?.icon}</Text>
                )}
                <View style={styles.postOverlay} />
                <Text style={styles.postTitle} numberOfLines={2}>{post.title}</Text>
                <Text style={styles.postLikes}>❤️ {post.like_count}</Text>
              </TouchableOpacity>
            );
          })
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: Spacing.base, paddingTop: 56, paddingBottom: Spacing.md,
  },
  backBtn: { padding: 4 },
  backIcon: { color: Colors.textPrimary, fontSize: 24, fontWeight: '700' },
  headerTitle: { fontSize: Fonts.sizes.lg, fontWeight: '700', color: Colors.textPrimary },
  moreIcon: { color: Colors.textPrimary, fontSize: 24 },
  profileSection: { paddingHorizontal: Spacing.base, alignItems: 'center', marginBottom: Spacing.lg },
  statsRow: { flexDirection: 'row', gap: Spacing['2xl'], marginTop: Spacing.base, marginBottom: Spacing.base },
  statItem: { alignItems: 'center' },
  statNumber: { fontSize: Fonts.sizes.xl, fontWeight: '800', color: Colors.textPrimary },
  statLabel: { fontSize: Fonts.sizes.xs, color: Colors.textMuted },
  bio: { color: Colors.textSecondary, fontSize: Fonts.sizes.md, textAlign: 'center', lineHeight: 20 },
  city: { color: Colors.textMuted, fontSize: Fonts.sizes.sm, marginTop: 4 },
  actionButtons: { flexDirection: 'row', gap: Spacing.sm, marginTop: Spacing.base },
  followBtn: {
    flex: 1, backgroundColor: Colors.primary, borderRadius: BorderRadius.md,
    paddingVertical: Spacing.sm, alignItems: 'center',
  },
  followBtnActive: { backgroundColor: Colors.surfaceLight, borderWidth: 1, borderColor: Colors.surfaceBorder },
  followBtnText: { color: Colors.white, fontWeight: '700', fontSize: Fonts.sizes.md },
  followBtnTextActive: { color: Colors.textPrimary },
  messageBtn: {
    backgroundColor: Colors.surfaceLight, borderRadius: BorderRadius.md,
    paddingVertical: Spacing.sm, paddingHorizontal: Spacing.base,
    borderWidth: 1, borderColor: Colors.surfaceBorder,
  },
  messageBtnText: { fontSize: 18 },
  postsGrid: {
    flexDirection: 'row', flexWrap: 'wrap', padding: Spacing.base, gap: Spacing.sm, paddingBottom: 40,
  },
  postCard: {
    width: GRID_SIZE, height: GRID_SIZE, borderRadius: BorderRadius.md,
    justifyContent: 'flex-end', padding: Spacing.md, overflow: 'hidden',
  },
  postImage: {
    ...StyleSheet.absoluteFillObject,
    width: '100%',
    height: '100%',
  },
  postOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.28)',
  },
  postEmoji: { fontSize: 32, position: 'absolute', top: Spacing.md, left: Spacing.md, opacity: 0.5 },
  postTitle: { color: Colors.white, fontSize: Fonts.sizes.sm, fontWeight: '700', zIndex: 1 },
  postLikes: { color: 'rgba(255,255,255,0.85)', fontSize: Fonts.sizes.xs, marginTop: 4, zIndex: 1 },
  emptyPosts: { width: '100%', alignItems: 'center', paddingVertical: Spacing['3xl'] },
  emptyIcon: { fontSize: 48, marginBottom: Spacing.md },
  emptyText: { color: Colors.textMuted, fontSize: Fonts.sizes.md },
});
