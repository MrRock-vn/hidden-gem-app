import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
} from 'react-native';
import { router } from 'expo-router';
import { Colors, Spacing, BorderRadius, Fonts, Categories } from '../constants/theme';
import { sharePlace } from '../utils/share';
import { getMediaUrl } from '../utils/media';

const categoryColors: Record<string, string> = {
  cafe: '#C07F00',
  food: '#E74C3C',
  photo: '#9B59B6',
  nature: '#27AE60',
  art: '#F39C12',
  nightlife: '#2C3E50',
  shopping: '#E91E63',
  historic: '#795548',
  beach: '#00BCD4',
  other: '#607D8B',
};

interface PlaceCardProps {
  place: {
    id: string;
    title: string;
    description?: string;
    category: string;
    address?: string;
    tags?: string[];
    like_count: number;
    comment_count?: number;
    bookmark_count?: number;
    created_at: string;
    images?: { url: string | null; order_idx: number }[];
    user?: { id: string; username: string; avatar_url: string | null };
    is_liked?: boolean;
    is_bookmarked?: boolean;
  };
  onLike?: () => void;
  onBookmark?: () => void;
  compact?: boolean;
}

export function formatCount(count: number | undefined) {
  if (!count) return '0';
  if (count >= 1000) return `${(count / 1000).toFixed(1)}k`;
  return count.toString();
}

export function getTimeAgo(dateStr: string | undefined) {
  if (!dateStr) return 'Vừa xong';
  const diff = Date.now() - new Date(dateStr).getTime();
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  if (days > 30) return `${Math.floor(days / 30)} tháng trước`;
  if (days > 0) return `${days} ngày trước`;
  const hours = Math.floor(diff / (1000 * 60 * 60));
  if (hours > 0) return `${hours} giờ trước`;
  const mins = Math.floor(diff / (1000 * 60));
  if (mins > 0) return `${mins} phút trước`;
  return 'Vừa xong';
}

export default function PlaceCard({ place, onLike, onBookmark, compact = false }: PlaceCardProps) {
  const categoryInfo = Categories.find((c) => c.id === place.category);
  const imageUrl = getMediaUrl(place.images?.[0]?.url);
  const avatarUrl = getMediaUrl(place.user?.avatar_url);

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={() => router.push(`/place/${place.id}`)}
      activeOpacity={0.9}
    >
      {/* Image */}
      <View style={[styles.cardImage, { backgroundColor: categoryColors[place.category] || Colors.surfaceLight }]}>
        {imageUrl ? (
          <Image source={{ uri: imageUrl }} style={styles.cardImageFull} resizeMode="cover" />
        ) : (
          <Text style={styles.cardImageEmoji}>{categoryInfo?.icon || '📍'}</Text>
        )}
        <View style={styles.cardCategoryBadge}>
          <Text style={styles.cardCategoryText}>
            {categoryInfo?.icon} {categoryInfo?.label}
          </Text>
        </View>
      </View>

      {/* Content */}
      <View style={styles.cardContent}>
        {/* User info */}
        {place.user && (
          <TouchableOpacity
            key={`${place.id}-user`}
            style={styles.cardUser}
            onPress={() => router.push(`/user/${place.user!.id}`)}
          >
            <View style={styles.avatar}>
              {avatarUrl ? (
                <Image source={{ uri: avatarUrl }} style={styles.avatarImage} />
              ) : (
                <Text style={styles.avatarText}>
                  {place.user.username.charAt(0).toUpperCase()}
                </Text>
              )}
            </View>
            <View>
              <Text style={styles.username}>@{place.user.username}</Text>
              <Text style={styles.timestamp}>{getTimeAgo(place.created_at)}</Text>
            </View>
          </TouchableOpacity>
        )}

        <Text key={`${place.id}-title`} style={styles.cardTitle} numberOfLines={1}>{place.title}</Text>
        {!compact && place.description && (
          <Text key={`${place.id}-desc`} style={styles.cardDescription} numberOfLines={2}>{place.description}</Text>
        )}

        {/* Tags */}
        {!compact && place.tags && place.tags.length > 0 && (
          <View key={`${place.id}-tagsrow`} style={styles.tagsRow}>
            {place.tags.map((tag, idx) => (
              <View key={`${place.id}-tag-${idx}`} style={styles.tag}>
                <Text style={styles.tagText}>#{tag}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Address */}
        {place.address && (
          <Text key={`${place.id}-addr`} style={styles.cardAddress} numberOfLines={1}>📍 {place.address}</Text>
        )}

        {/* Stats */}
        <View key={`${place.id}-stats`} style={styles.cardStats}>
          <TouchableOpacity style={styles.statItem} onPress={onLike}>
            <Text style={styles.statIcon}>{place.is_liked ? '❤️' : '🤍'}</Text>
            <Text style={[styles.statText, place.is_liked && styles.statTextActive]}>
              {formatCount(place.like_count)}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.statItem}
            onPress={() => router.push(`/place/${place.id}/comments`)}
          >
            <Text style={styles.statIcon}>💬</Text>
            <Text style={styles.statText}>{formatCount(place.comment_count || 0)}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.statItem} onPress={onBookmark}>
            <Text style={styles.statIcon}>{place.is_bookmarked ? '🔖' : '📑'}</Text>
            <Text style={[styles.statText, place.is_bookmarked && styles.statTextActive]}>
              {formatCount(place.bookmark_count || 0)}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.statItem} onPress={() => sharePlace(place)}>
            <Text style={styles.statIcon}>↗️</Text>
            <Text style={styles.statText}>Chia sẻ</Text>
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.backgroundCard,
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing.base,
    overflow: 'hidden',
    borderWidth: 0.5,
    borderColor: Colors.surfaceBorder,
  },
  cardImage: {
    height: 180,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  cardImageFull: {
    width: '100%',
    height: '100%',
  },
  cardImageEmoji: { fontSize: 48, opacity: 0.3 },
  cardCategoryBadge: {
    position: 'absolute',
    top: Spacing.md,
    left: Spacing.md,
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.full,
  },
  cardCategoryText: { color: Colors.white, fontSize: Fonts.sizes.xs, fontWeight: '600' },
  cardContent: { padding: Spacing.base },
  cardUser: { flexDirection: 'row', alignItems: 'center', marginBottom: Spacing.sm },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.sm,
    overflow: 'hidden',
  },
  avatarImage: { width: 32, height: 32, borderRadius: 16 },
  avatarText: { color: Colors.white, fontWeight: '700', fontSize: 14 },
  username: { color: Colors.textPrimary, fontWeight: '600', fontSize: Fonts.sizes.sm },
  timestamp: { color: Colors.textMuted, fontSize: Fonts.sizes.xs },
  cardTitle: { fontSize: Fonts.sizes.lg, fontWeight: '700', color: Colors.textPrimary, marginBottom: 4 },
  cardDescription: { fontSize: Fonts.sizes.md, color: Colors.textSecondary, lineHeight: 20, marginBottom: Spacing.sm },
  tagsRow: { marginBottom: Spacing.sm },
  tag: {
    backgroundColor: Colors.surfaceLight,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 3,
    borderRadius: BorderRadius.full,
    marginRight: Spacing.xs,
  },
  tagText: { color: Colors.primary, fontSize: Fonts.sizes.xs, fontWeight: '500' },
  cardAddress: { fontSize: Fonts.sizes.xs, color: Colors.textMuted, marginBottom: Spacing.sm },
  cardStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 0.5,
    borderTopColor: Colors.surfaceBorder,
    paddingTop: Spacing.md,
    marginTop: Spacing.xs,
  },
  statItem: { flexDirection: 'row', alignItems: 'center' },
  statIcon: { fontSize: 14, marginRight: 4 },
  statText: { color: Colors.textSecondary, fontSize: Fonts.sizes.sm },
  statTextActive: { color: Colors.primary, fontWeight: '600' },
});
