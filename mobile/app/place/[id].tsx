import React, { useState } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, ScrollView, Dimensions, Share, Image,
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { usePlaceDetail, useToggleLike } from '../../hooks/usePlaces';
import UserAvatar from '../../components/UserAvatar';
import LoadingScreen from '../../components/LoadingScreen';
import { formatCount, getTimeAgo } from '../../components/PlaceCard';
import { Colors, Spacing, BorderRadius, Fonts, Categories } from '../../constants/theme';
import { getMediaUrl } from '../../utils/media';

const { width } = Dimensions.get('window');

const categoryColors: Record<string, string> = {
  cafe: '#C07F00', food: '#E74C3C', photo: '#9B59B6', nature: '#27AE60',
  art: '#F39C12', nightlife: '#2C3E50',
};

export default function PlaceDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data: place, isLoading } = usePlaceDetail(id);
  const toggleLikeMutation = useToggleLike();
  const [currentImage, setCurrentImage] = useState(0);
  const [isBookmarked, setIsBookmarked] = useState(false);

  if (isLoading || !place) {
    return <LoadingScreen message="Đang tải địa điểm..." />;
  }

  const catInfo = Categories.find((c) => c.id === place.category);

  const toggleLike = () => {
    toggleLikeMutation.mutate(place.id);
  };

  const handleShare = async () => {
    try {
      await Share.share({ message: `Khám phá ${place.title} trên Hidden Gem! 🗺️\n📍 ${place.address}` });
    } catch {}
  };

  const images = place.images || [{ url: null, order_idx: 0 }];

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Image Gallery */}
        <View style={styles.gallery}>
          <ScrollView horizontal pagingEnabled showsHorizontalScrollIndicator={false}
            onScroll={(e) => setCurrentImage(Math.round(e.nativeEvent.contentOffset.x / width))}
            scrollEventThrottle={16}
          >
            {images.map((img, i) => (
              <View key={`${place.id}-image-${i}`} style={[styles.galleryImage, { backgroundColor: categoryColors[place.category] || '#333' }]}>
                {getMediaUrl(img.url) ? (
                  <Image source={{ uri: getMediaUrl(img.url)! }} style={styles.galleryImageFull} resizeMode="cover" />
                ) : (
                  <>
                    <Text style={styles.galleryEmoji}>{catInfo?.icon || '📍'}</Text>
                    <Text style={styles.galleryIndex}>{i + 1}/{images.length}</Text>
                  </>
                )}
              </View>
            ))}
          </ScrollView>

          {/* Back button */}
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Text style={styles.backIcon}>←</Text>
          </TouchableOpacity>

          {/* Dots */}
          {images.length > 1 && (
            <View style={styles.dots}>
              {images.map((_, i) => (
                <View key={`dot-${i}`} style={[styles.dot, i === currentImage && styles.dotActive]} />
              ))}
            </View>
          )}
        </View>

        {/* Content */}
        <View style={styles.content}>
          {/* Category + User */}
          <View style={styles.metaRow}>
            <View style={styles.categoryBadge}>
              <Text style={styles.categoryText}>{catInfo?.icon} {catInfo?.label}</Text>
            </View>
            {place.user && (
              <TouchableOpacity style={styles.userRow} onPress={() => router.push(`/user/${place.user!.id}`)}>
                <UserAvatar uri={place.user.avatar_url} username={place.user.username} size={24} />
                <Text style={styles.userText}> @{place.user.username}</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Title */}
          <Text style={styles.title}>{place.title}</Text>

          {/* Timestamp */}
          <Text style={styles.timeText}>{getTimeAgo(place.created_at)}</Text>

          {/* Address */}
          {place.address && (
            <TouchableOpacity 
              style={styles.addressRow}
              onPress={() => {
                if (place.latitude && place.longitude) {
                  router.push({
                    pathname: '/(tabs)/map',
                    params: { placeId: place.id }
                  });
                }
              }}
            >
              <Text style={styles.addressIcon}>📍</Text>
              <Text style={styles.addressText}>{place.address}</Text>
            </TouchableOpacity>
          )}

          {/* Tags */}
          {place.tags && place.tags.length > 0 && (
            <View key={`${place.id}-tags`} style={styles.tagsRow}>
              {place.tags.map((tag, idx) => (
                <View key={`${place.id}-tag-${idx}`} style={styles.tag}>
                  <Text style={styles.tagText}>#{tag}</Text>
                </View>
              ))}
            </View>
          )}

          {/* Description */}
          {place.description && (
            <Text style={styles.description}>{place.description}</Text>
          )}

          {/* Mini Map */}
          <TouchableOpacity 
            style={styles.miniMap}
            onPress={() => {
              if (place.latitude && place.longitude) {
                router.push({
                  pathname: '/(tabs)/map',
                  params: { placeId: place.id }
                });
              }
            }}
          >
            <Text style={styles.miniMapText}>🗺️ Xem trên bản đồ</Text>
            {(place as any).latitude && (
              <Text style={styles.miniMapCoords}>
                {(place as any).latitude.toFixed(4)}, {(place as any).longitude.toFixed(4)}
              </Text>
            )}
          </TouchableOpacity>

          {/* Comments Preview */}
          <TouchableOpacity
            style={styles.commentSection}
            onPress={() => router.push(`/place/comments/${id}`)}
          >
            <View style={styles.commentHeader}>
              <Text style={styles.commentTitle}>💬 Bình luận ({place.comment_count || 0})</Text>
              <Text style={styles.commentArrow}>Xem tất cả →</Text>
            </View>
          </TouchableOpacity>

          {/* Report */}
          <TouchableOpacity style={styles.reportButton}>
            <Text style={styles.reportText}>🚩 Báo cáo địa điểm</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Bottom Action Bar */}
      <View style={styles.bottomBar}>
        <TouchableOpacity style={styles.actionButton} onPress={toggleLike}>
          <Text style={styles.actionIcon}>{place.is_liked ? '❤️' : '🤍'}</Text>
          <Text style={[styles.actionText, place.is_liked && styles.actionTextActive]}>
            {formatCount(place.like_count)}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionButton}
          onPress={() => router.push(`/place/comments/${id}`)}>
          <Text style={styles.actionIcon}>💬</Text>
          <Text style={styles.actionText}>{formatCount(place.comment_count || 0)}</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionButton}
          onPress={() => setIsBookmarked(!isBookmarked)}>
          <Text style={styles.actionIcon}>{isBookmarked || place.is_bookmarked ? '🔖' : '📑'}</Text>
          <Text style={[styles.actionText, (isBookmarked || place.is_bookmarked) && styles.actionTextActive]}>
            {formatCount((place.bookmark_count || 0) + (isBookmarked && !place.is_bookmarked ? 1 : 0))}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionButton} onPress={handleShare}>
          <Text style={styles.actionIcon}>↗️</Text>
          <Text style={styles.actionText}>Chia sẻ</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  gallery: { height: 300, position: 'relative' },
  galleryImage: { width, height: 300, justifyContent: 'center', alignItems: 'center' },
  galleryImageFull: { width: '100%', height: '100%' },
  galleryEmoji: { fontSize: 64, opacity: 0.3 },
  galleryIndex: { position: 'absolute', bottom: 12, right: 16, color: 'rgba(255,255,255,0.7)', fontSize: 12 },
  backButton: {
    position: 'absolute', top: 50, left: 16, width: 40, height: 40, borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center',
  },
  backIcon: { color: Colors.white, fontSize: 20, fontWeight: '700' },
  dots: { position: 'absolute', bottom: 16, flexDirection: 'row', alignSelf: 'center', gap: 6 },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: 'rgba(255,255,255,0.4)' },
  dotActive: { backgroundColor: Colors.white, width: 20 },
  content: { padding: Spacing.base, paddingBottom: 100 },
  metaRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.md },
  categoryBadge: {
    backgroundColor: Colors.surfaceLight, paddingHorizontal: Spacing.md, paddingVertical: 4,
    borderRadius: BorderRadius.full,
  },
  categoryText: { color: Colors.textSecondary, fontSize: Fonts.sizes.sm },
  userRow: { flexDirection: 'row', alignItems: 'center' },
  userText: { color: Colors.primary, fontSize: Fonts.sizes.sm, fontWeight: '600' },
  title: { fontSize: Fonts.sizes['2xl'], fontWeight: '800', color: Colors.textPrimary, marginBottom: Spacing.xs },
  timeText: { color: Colors.textMuted, fontSize: Fonts.sizes.sm, marginBottom: Spacing.md },
  addressRow: { flexDirection: 'row', alignItems: 'center', marginBottom: Spacing.md },
  addressIcon: { fontSize: 14, marginRight: 6 },
  addressText: { color: Colors.textSecondary, fontSize: Fonts.sizes.md, flex: 1 },
  tagsRow: { marginBottom: Spacing.base },
  tag: {
    backgroundColor: Colors.surfaceLight, paddingHorizontal: Spacing.md, paddingVertical: 4,
    borderRadius: BorderRadius.full, marginRight: Spacing.sm,
  },
  tagText: { color: Colors.primary, fontSize: Fonts.sizes.sm },
  description: { color: Colors.textSecondary, fontSize: Fonts.sizes.base, lineHeight: 24, marginBottom: Spacing.xl },
  miniMap: {
    backgroundColor: Colors.surfaceLight, borderRadius: BorderRadius.lg, padding: Spacing.lg,
    alignItems: 'center', marginBottom: Spacing.lg, borderWidth: 1, borderColor: Colors.surfaceBorder,
  },
  miniMapText: { color: Colors.textPrimary, fontSize: Fonts.sizes.base, fontWeight: '600' },
  miniMapCoords: { color: Colors.textMuted, fontSize: Fonts.sizes.xs, marginTop: 4 },
  commentSection: {
    backgroundColor: Colors.surfaceLight, borderRadius: BorderRadius.lg, padding: Spacing.base,
    marginBottom: Spacing.lg, borderWidth: 1, borderColor: Colors.surfaceBorder,
  },
  commentHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  commentTitle: { color: Colors.textPrimary, fontSize: Fonts.sizes.base, fontWeight: '600' },
  commentArrow: { color: Colors.primary, fontSize: Fonts.sizes.sm },
  reportButton: { alignItems: 'center', paddingVertical: Spacing.md },
  reportText: { color: Colors.textMuted, fontSize: Fonts.sizes.sm },
  bottomBar: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center',
    backgroundColor: Colors.backgroundLight, borderTopWidth: 0.5,
    borderTopColor: Colors.surfaceBorder, paddingVertical: Spacing.md, paddingBottom: 30,
  },
  actionButton: { alignItems: 'center' },
  actionIcon: { fontSize: 22 },
  actionText: { color: Colors.textSecondary, fontSize: Fonts.sizes.xs, marginTop: 2 },
  actionTextActive: { color: Colors.primary },
});
