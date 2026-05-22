import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Dimensions,
  Image,
} from 'react-native';
import { router } from 'expo-router';
import { useAuthStore } from '../../stores/authStore';
import { useMyProfile } from '../../hooks/useUser';
import { useUserPlaces } from '../../hooks/usePlaces';
import UserAvatar from '../../components/UserAvatar';
import LoadingScreen from '../../components/LoadingScreen';
import { Colors, Spacing, BorderRadius, Fonts, Categories } from '../../constants/theme';
import { getMediaUrl } from '../../utils/media';

const { width } = Dimensions.get('window');
const GRID_SIZE = (width - Spacing.base * 3) / 2;

const categoryColors: Record<string, string> = {
  cafe: '#C07F00', food: '#E74C3C', photo: '#9B59B6', nature: '#27AE60',
  art: '#F39C12', nightlife: '#2C3E50', shopping: '#E91E63', historic: '#795548',
};

export default function ProfileScreen() {
  const [activeTab, setActiveTab] = useState<'posts' | 'saved'>('posts');
  const { isAuthenticated, user, logout } = useAuthStore();

  const { data: profile, isLoading: profileLoading } = useMyProfile();
  const { data: userPosts, isLoading: postsLoading } = useUserPlaces(user?.id || 'me');

  if (!isAuthenticated) {
    return (
      <View style={styles.authPrompt}>
        <Text style={styles.authIcon}>👤</Text>
        <Text style={styles.authTitle}>Đăng nhập để xem hồ sơ</Text>
        <Text style={styles.authSubtitle}>Quản lý bài đăng và kết nối với cộng đồng</Text>
        <TouchableOpacity
          style={styles.authButton}
          onPress={() => router.push('/(auth)/login')}
        >
          <Text style={styles.authButtonText}>Đăng nhập</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (profileLoading) {
    return <LoadingScreen message="Đang tải hồ sơ..." />;
  }

  const displayUser = profile || {
    username: user?.username || 'user',
    bio: user?.bio || '',
    city: user?.city || '',
    avatar_url: user?.avatar_url || null,
    followers_count: 0,
    following_count: 0,
    posts_count: 0,
  };

  const formatCount = (count: number) => {
    if (count >= 1000) return `${(count / 1000).toFixed(1)}k`;
    return count.toString();
  };

  const posts = userPosts || [];

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header with settings and chat */}
      <View style={styles.header}>
        <Text style={styles.headerUsername}>@{displayUser.username}</Text>
        <View style={styles.headerActions}>
          <TouchableOpacity onPress={() => router.push('/chat')} style={styles.headerActionBtn}>
            <Text style={styles.chatIcon}>💬</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => router.push('/settings')} style={styles.headerActionBtn}>
            <Text style={styles.settingsIcon}>⚙️</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Profile Info */}
      <View style={styles.profileSection}>
        <View style={styles.avatarWrapper}>
          <UserAvatar
            uri={displayUser.avatar_url}
            username={displayUser.username}
            size={80}
          />
        </View>

        {/* Stats */}
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{(displayUser as any).posts_count ?? posts.length}</Text>
            <Text style={styles.statLabel}>Bài đăng</Text>
          </View>
          <TouchableOpacity
            style={styles.statItem}
            onPress={() => router.push('/user/following')}
          >
            <Text style={styles.statNumber}>{formatCount((displayUser as any).followers_count || 0)}</Text>
            <Text style={styles.statLabel}>Follower</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.statItem}
            onPress={() => router.push('/user/following')}
          >
            <Text style={styles.statNumber}>{formatCount((displayUser as any).following_count || 0)}</Text>
            <Text style={styles.statLabel}>Following</Text>
          </TouchableOpacity>
        </View>

        {/* Bio */}
        <View style={styles.bioSection}>
          <Text style={styles.displayName}>{displayUser.username}</Text>
          {displayUser.city && (
            <Text style={styles.cityText}>📍 {displayUser.city}</Text>
          )}
          {displayUser.bio && (
            <Text style={styles.bioText}>{displayUser.bio}</Text>
          )}
        </View>

        {/* Action Buttons */}
        <View style={styles.actionRow}>
          <TouchableOpacity
            style={styles.editButton}
            onPress={() => router.push('/settings/edit-profile')}
          >
            <Text style={styles.editButtonText}>Chỉnh sửa hồ sơ</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.bookmarkButton}
            onPress={() => router.push('/bookmarks')}
          >
            <Text style={styles.bookmarkButtonText}>🔖</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Content Tabs */}
      <View style={styles.tabBar}>
        <TouchableOpacity
          style={[styles.tabItem, activeTab === 'posts' && styles.tabItemActive]}
          onPress={() => setActiveTab('posts')}
        >
          <Text style={[styles.tabItemText, activeTab === 'posts' && styles.tabItemTextActive]}>
            📍 Bài đăng
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tabItem, activeTab === 'saved' && styles.tabItemActive]}
          onPress={() => setActiveTab('saved')}
        >
          <Text style={[styles.tabItemText, activeTab === 'saved' && styles.tabItemTextActive]}>
            🔖 Đã lưu
          </Text>
        </TouchableOpacity>
      </View>

      {/* Posts Grid */}
      <View style={styles.postsGrid}>
        {!posts || posts.length === 0 ? (
          <View style={styles.emptyPosts}>
            <Text style={styles.emptyIcon}>📍</Text>
            <Text style={styles.emptyText}>Chưa có bài đăng nào</Text>
            <TouchableOpacity
              style={styles.createBtn}
              onPress={() => router.push('/place/create')}
            >
              <Text style={styles.createBtnText}>Đăng địa điểm đầu tiên</Text>
            </TouchableOpacity>
          </View>
        ) : (
          Array.isArray(posts) && posts.map((post) => {
            const imageUrl = getMediaUrl(post.images?.[0]?.url);

            return (
              <TouchableOpacity
                key={post.id}
                style={[styles.postCard, { backgroundColor: categoryColors[post.category] || Colors.surfaceLight }]}
                onPress={() => router.push(`/place/${post.id}`)}
              >
                {imageUrl ? (
                  <Image source={{ uri: imageUrl }} style={styles.postImage} resizeMode="cover" />
                ) : (
                  <Text style={styles.postEmoji}>
                    {Categories.find((c) => c.id === post.category)?.icon}
                  </Text>
                )}
                <View style={styles.postOverlay} />
                <Text style={styles.postTitle} numberOfLines={2}>{post.title}</Text>
                <Text style={styles.postLikes}>❤️ {post.like_count}</Text>
              </TouchableOpacity>
            );
          })
        )}
      </View>

      {/* Logout */}
      <TouchableOpacity style={styles.logoutButton} onPress={logout}>
        <Text style={styles.logoutText}>Đăng xuất</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  authPrompt: {
    flex: 1, backgroundColor: Colors.background,
    justifyContent: 'center', alignItems: 'center', padding: Spacing.xl,
  },
  authIcon: { fontSize: 64, marginBottom: Spacing.lg },
  authTitle: { fontSize: Fonts.sizes.xl, fontWeight: '700', color: Colors.textPrimary },
  authSubtitle: { fontSize: Fonts.sizes.md, color: Colors.textSecondary, marginTop: Spacing.sm, textAlign: 'center' },
  authButton: {
    backgroundColor: Colors.primary, borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing['2xl'], paddingVertical: Spacing.md, marginTop: Spacing.xl,
  },
  authButtonText: { color: Colors.white, fontSize: Fonts.sizes.lg, fontWeight: '700' },
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: Spacing.base, paddingTop: 60, paddingBottom: Spacing.md,
  },
  headerUsername: { fontSize: Fonts.sizes.xl, fontWeight: '800', color: Colors.textPrimary },
  settingsIcon: { fontSize: 24 },
  chatIcon: { fontSize: 24 },
  headerActions: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
  headerActionBtn: { padding: 4 },
  profileSection: { paddingHorizontal: Spacing.base },
  avatarWrapper: {
    alignSelf: 'center',
    marginBottom: Spacing.base,
    borderWidth: 3,
    borderColor: Colors.primaryLight,
    borderRadius: 43,
    padding: 3,
  },
  statsRow: { flexDirection: 'row', justifyContent: 'center', gap: Spacing['2xl'], marginBottom: Spacing.base },
  statItem: { alignItems: 'center' },
  statNumber: { fontSize: Fonts.sizes.xl, fontWeight: '800', color: Colors.textPrimary },
  statLabel: { fontSize: Fonts.sizes.xs, color: Colors.textMuted, marginTop: 2 },
  bioSection: { marginBottom: Spacing.base },
  displayName: { fontSize: Fonts.sizes.base, fontWeight: '700', color: Colors.textPrimary },
  cityText: { fontSize: Fonts.sizes.sm, color: Colors.textSecondary, marginTop: 2 },
  bioText: { fontSize: Fonts.sizes.md, color: Colors.textSecondary, marginTop: Spacing.xs, lineHeight: 20 },
  actionRow: { flexDirection: 'row', gap: Spacing.sm, marginBottom: Spacing.lg },
  editButton: {
    flex: 1, backgroundColor: Colors.surfaceLight, borderRadius: BorderRadius.md,
    paddingVertical: Spacing.sm, alignItems: 'center',
    borderWidth: 1, borderColor: Colors.surfaceBorder,
  },
  editButtonText: { color: Colors.textPrimary, fontWeight: '600', fontSize: Fonts.sizes.md },
  bookmarkButton: {
    backgroundColor: Colors.surfaceLight, borderRadius: BorderRadius.md,
    paddingVertical: Spacing.sm, paddingHorizontal: Spacing.base,
    borderWidth: 1, borderColor: Colors.surfaceBorder,
  },
  bookmarkButtonText: { fontSize: 18 },
  tabBar: {
    flexDirection: 'row', borderBottomWidth: 0.5,
    borderBottomColor: Colors.surfaceBorder,
  },
  tabItem: { flex: 1, paddingVertical: Spacing.md, alignItems: 'center' },
  tabItemActive: { borderBottomWidth: 2, borderBottomColor: Colors.primary },
  tabItemText: { color: Colors.textMuted, fontSize: Fonts.sizes.md },
  tabItemTextActive: { color: Colors.primary, fontWeight: '700' },
  postsGrid: {
    flexDirection: 'row', flexWrap: 'wrap',
    padding: Spacing.base, gap: Spacing.sm,
    paddingBottom: 40,
  },
  postCard: {
    width: GRID_SIZE, height: GRID_SIZE, borderRadius: BorderRadius.md,
    justifyContent: 'flex-end', padding: Spacing.md,
    overflow: 'hidden',
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
  emptyPosts: {
    width: '100%', alignItems: 'center', paddingVertical: Spacing['3xl'],
  },
  emptyIcon: { fontSize: 48, marginBottom: Spacing.md },
  emptyText: { color: Colors.textMuted, fontSize: Fonts.sizes.md },
  createBtn: {
    marginTop: Spacing.base, backgroundColor: Colors.primary, borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.xl, paddingVertical: Spacing.sm,
  },
  createBtnText: { color: Colors.white, fontWeight: '600', fontSize: Fonts.sizes.md },
  logoutButton: {
    marginHorizontal: Spacing.base, marginBottom: 120,
    paddingVertical: Spacing.md, alignItems: 'center',
    borderRadius: BorderRadius.md, borderWidth: 1, borderColor: Colors.error,
  },
  logoutText: { color: Colors.error, fontSize: Fonts.sizes.md, fontWeight: '600' },
});
