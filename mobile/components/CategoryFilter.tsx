import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { Colors, Spacing, BorderRadius, Fonts, Categories } from '../constants/theme';

interface CategoryFilterProps {
  selectedCategory: string | null;
  nearbyMode: boolean;
  userLocation: { lat: number; lng: number } | null;
  onCategoryChange: (category: string | null) => void;
  onNearbyToggle: () => void;
  onRequestLocation: () => void;
}

export default function CategoryFilter({
  selectedCategory,
  nearbyMode,
  userLocation,
  onCategoryChange,
  onNearbyToggle,
  onRequestLocation,
}: CategoryFilterProps) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      style={styles.categoryFilter}
      contentContainerStyle={styles.categoryContent}
      scrollEventThrottle={16}
    >
      {/* Nearby button */}
      <TouchableOpacity
        key="nearby-btn"
        style={[
          styles.categoryChip,
          nearbyMode && styles.categoryChipActive,
          !userLocation && styles.categoryChipDisabled,
        ]}
        onPress={() => {
          if (userLocation) {
            onNearbyToggle();
          } else {
            onRequestLocation();
          }
        }}
        disabled={!userLocation && !nearbyMode}
      >
        <Text
          style={[
            styles.categoryChipText,
            nearbyMode && styles.categoryChipTextActive,
          ]}
        >
          📍 Gần tôi
        </Text>
      </TouchableOpacity>

      {/* All categories */}
      <TouchableOpacity
        key="all-categories"
        style={[
          styles.categoryChip,
          !selectedCategory && !nearbyMode && styles.categoryChipActive,
        ]}
        onPress={() => {
          onCategoryChange(null);
        }}
      >
        <Text
          style={[
            styles.categoryChipText,
            !selectedCategory && !nearbyMode && styles.categoryChipTextActive,
          ]}
        >
          ✨ Tất cả
        </Text>
      </TouchableOpacity>

      {/* Categories */}
      {Categories.map((cat) => (
        <TouchableOpacity
          key={cat.id}
          style={[
            styles.categoryChip,
            selectedCategory === cat.id && styles.categoryChipActive,
          ]}
          onPress={() =>
            onCategoryChange(selectedCategory === cat.id ? null : cat.id)
          }
        >
          <Text
            style={[
              styles.categoryChipText,
              selectedCategory === cat.id && styles.categoryChipTextActive,
            ]}
          >
            {cat.icon} {cat.label}
          </Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  categoryFilter: {
    maxHeight: 50,
    borderBottomWidth: 0.5,
    borderBottomColor: Colors.surfaceBorder,
  },
  categoryContent: {
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.sm,
    gap: Spacing.sm,
  },
  categoryChip: {
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.surfaceLight,
    borderWidth: 1,
    borderColor: Colors.surfaceBorder,
    marginRight: Spacing.sm,
  },
  categoryChipActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  categoryChipDisabled: {
    opacity: 0.5,
  },
  categoryChipText: {
    fontSize: Fonts.sizes.sm,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  categoryChipTextActive: { color: Colors.white, fontWeight: '700' },
});
