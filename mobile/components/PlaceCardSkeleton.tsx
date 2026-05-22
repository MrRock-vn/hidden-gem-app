import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Colors, Spacing, BorderRadius } from '../constants/theme';

export default function PlaceCardSkeleton() {
  return (
    <View style={styles.card}>
      {/* Image skeleton */}
      <View style={[styles.skeleton, styles.imageSkeleton]} />

      {/* Content skeleton */}
      <View style={styles.cardContent}>
        {/* User skeleton */}
        <View style={styles.userRow}>
          <View style={[styles.skeleton, styles.avatar]} />
          <View style={{ flex: 1 }}>
            <View style={[styles.skeleton, styles.username]} />
            <View style={[styles.skeleton, styles.timestamp]} />
          </View>
        </View>

        {/* Title skeleton */}
        <View style={[styles.skeleton, styles.title]} />

        {/* Description skeleton */}
        <View style={[styles.skeleton, styles.description]} />
        <View style={[styles.skeleton, { height: 12, marginBottom: Spacing.sm }]} />

        {/* Tags skeleton */}
        <View style={styles.tagsRow}>
          <View style={[styles.skeleton, styles.tag]} />
          <View style={[styles.skeleton, styles.tag]} />
          <View style={[styles.skeleton, styles.tag]} />
        </View>

        {/* Address skeleton */}
        <View style={[styles.skeleton, styles.address]} />

        {/* Stats skeleton */}
        <View style={styles.statsRow}>
          <View style={[styles.skeleton, styles.stat]} />
          <View style={[styles.skeleton, styles.stat]} />
          <View style={[styles.skeleton, styles.stat]} />
          <View style={[styles.skeleton, styles.stat]} />
        </View>
      </View>
    </View>
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
  skeleton: {
    backgroundColor: Colors.surfaceLight,
    borderRadius: BorderRadius.md,
  },
  imageSkeleton: {
    height: 180,
    width: '100%',
  },
  cardContent: {
    padding: Spacing.base,
  },
  userRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: Spacing.sm,
  },
  username: {
    height: 12,
    width: '60%',
    marginBottom: 4,
  },
  timestamp: {
    height: 10,
    width: '40%',
  },
  title: {
    height: 16,
    width: '80%',
    marginBottom: Spacing.sm,
  },
  description: {
    height: 12,
    width: '100%',
    marginBottom: 4,
  },
  tagsRow: {
    flexDirection: 'row',
    gap: Spacing.xs,
    marginBottom: Spacing.sm,
  },
  tag: {
    height: 20,
    width: 50,
    borderRadius: BorderRadius.full,
  },
  address: {
    height: 12,
    width: '70%',
    marginBottom: Spacing.sm,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: Spacing.md,
    borderTopWidth: 0.5,
    borderTopColor: Colors.surfaceBorder,
  },
  stat: {
    height: 14,
    width: '20%',
  },
});
