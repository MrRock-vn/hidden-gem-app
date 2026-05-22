import React, { useState, useCallback, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  ScrollView,
  Image,
} from 'react-native';
import { router } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { searchAPI } from '../../services/api';
import { usePlaces } from '../../hooks/usePlaces';
import EmptyState from '../../components/EmptyState';
import { Colors, Spacing, BorderRadius, Fonts, Categories } from '../../constants/theme';
import { getMediaUrl } from '../../utils/media';

const SEARCH_HISTORY = ['cà phê vintage', 'bún bò gần đây', 'quán chụp ảnh'];
const TRENDING_TAGS = ['#rooftop', '#hidden_cafe', '#street_food', '#sunset', '#local_gem', '#vintage'];

export default function SearchScreen() {
  const [query, setQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Search query with debounce
  const { data: searchResults, isLoading: isSearchLoading } = useQuery({
    queryKey: ['search', query, selectedCategory],
    queryFn: async () => {
      try {
        const { data } = await searchAPI.search(query, selectedCategory ? { category: selectedCategory } : undefined);
        // Backend returns { places: { data: [...], total: 0 }, users: { data: [...], total: 0 } }
        return data?.places?.data || [];
      } catch (error) {
        console.error('Search error:', error);
        return null; // Will fallback to local filter
      }
    },
    enabled: query.length >= 2,
    staleTime: 30 * 1000,
  });

  // Local results from places data as fallback
  const { data: allPlaces } = usePlaces();

  const filteredResults = (() => {
    if (searchResults) return searchResults;
    if (!allPlaces || !Array.isArray(allPlaces)) return [];
    return allPlaces.filter((r) => {
      const matchQuery = !query || r.title.toLowerCase().includes(query.toLowerCase()) ||
        r.tags?.some((t: string) => t.toLowerCase().includes(query.toLowerCase()));
      const matchCategory = !selectedCategory || r.category === selectedCategory;
      return matchQuery && matchCategory;
    });
  })();

  const handleSearch = useCallback((text: string) => {
    setQuery(text);
    setIsSearching(text.length > 0);
  }, []);

  return (
    <View style={styles.container}>
      {/* Search Bar */}
      <View style={styles.searchBar}>
        <Text style={styles.searchIcon}>🔍</Text>
        <TextInput
          style={styles.searchInput}
          placeholder="Tìm kiếm địa điểm, tag, khu vực..."
          placeholderTextColor={Colors.textMuted}
          value={query}
          onChangeText={handleSearch}
          autoCorrect={false}
        />
        {query.length > 0 && (
          <TouchableOpacity onPress={() => handleSearch('')}>
            <Text style={styles.clearIcon}>✕</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Category Filter */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.categoryScroll}
        contentContainerStyle={styles.categoryContent}
      >
        {Categories.map((cat) => (
          <TouchableOpacity
            key={cat.id}
            style={[styles.categoryChip, selectedCategory === cat.id && styles.categoryChipActive]}
            onPress={() => setSelectedCategory(selectedCategory === cat.id ? null : cat.id)}
          >
            <Text style={[styles.categoryChipText, selectedCategory === cat.id && styles.categoryChipTextActive]}>
              {cat.icon} {cat.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {!isSearching ? (
        <ScrollView style={styles.defaultContent}>
          {/* Search History */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>🕐 Tìm kiếm gần đây</Text>
              <TouchableOpacity>
                <Text style={styles.clearAll}>Xóa tất cả</Text>
              </TouchableOpacity>
            </View>
            {SEARCH_HISTORY.map((item, i) => (
              <TouchableOpacity
                key={`history-${i}`}
                style={styles.historyItem}
                onPress={() => handleSearch(item)}
              >
                <Text style={styles.historyIcon}>🕐</Text>
                <Text style={styles.historyText}>{item}</Text>
                <Text style={styles.historyArrow}>↗️</Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Trending Tags */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>🔥 Xu hướng</Text>
            <View style={styles.tagsGrid}>
              {TRENDING_TAGS.map((tag, i) => (
                <TouchableOpacity key={`trending-${i}`} style={styles.trendingTag} onPress={() => handleSearch(tag)}>
                  <Text style={styles.trendingTagText}>{tag}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Popular Nearby */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>⭐ Phổ biến gần bạn</Text>
            {Array.isArray(allPlaces) ? allPlaces.slice(0, 3).map((item, idx) => (
              <TouchableOpacity
                key={`popular-${item.id}`}
                style={styles.popularItem}
                onPress={() => router.push(`/place/${item.id}`)}
              >
                <View style={styles.popularRank}>
                  <Text style={styles.popularRankText}>
                    {Categories.find((c) => c.id === item.category)?.icon}
                  </Text>
                </View>
                <View style={styles.popularInfo}>
                  <Text style={styles.popularTitle}>{item.title}</Text>
                  <Text style={styles.popularAddress}>{item.address}</Text>
                </View>
                <Text style={styles.popularLike}>❤️ {item.like_count}</Text>
              </TouchableOpacity>
            )) : null}
          </View>
        </ScrollView>
      ) : (
        <FlatList
          data={filteredResults}
          keyExtractor={(item: any) => item.id}
          contentContainerStyle={styles.resultsList}
          renderItem={({ item }: { item: any }) => (
            <TouchableOpacity
              style={styles.resultItem}
              onPress={() => router.push(`/place/${item.id}`)}
            >
              {getMediaUrl(item.images?.[0]?.url) ? (
                <Image
                  source={{ uri: getMediaUrl(item.images?.[0]?.url)! }}
                  style={styles.resultImage}
                  resizeMode="cover"
                />
              ) : (
                <View style={styles.resultIcon}>
                  <Text style={styles.resultIconText}>
                    {Categories.find((c) => c.id === item.category)?.icon || 'P'}
                  </Text>
                </View>
              )}
              <View style={styles.resultInfo}>
                <Text style={styles.resultTitle}>{item.title}</Text>
                <Text style={styles.resultAddress}>📍 {item.address}</Text>
                <View style={styles.resultMeta}>
                  <Text style={styles.resultLikes}>❤️ {item.like_count}</Text>
                  {item.comment_count !== undefined && (
                    <Text style={styles.resultLikes}>💬 {item.comment_count}</Text>
                  )}
                </View>
              </View>
            </TouchableOpacity>
          )}
          ListEmptyComponent={
            <EmptyState
              icon="🔍"
              title="Không tìm thấy kết quả"
              message="Thử tìm kiếm với từ khóa khác"
            />
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  searchBar: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: Colors.surfaceLight, borderRadius: BorderRadius.md,
    marginHorizontal: Spacing.base, marginTop: Spacing.sm,
    paddingHorizontal: Spacing.base, height: 48,
    borderWidth: 1, borderColor: Colors.surfaceBorder,
  },
  searchIcon: { fontSize: 16, marginRight: Spacing.sm },
  searchInput: { flex: 1, color: Colors.textPrimary, fontSize: Fonts.sizes.base },
  clearIcon: { color: Colors.textMuted, fontSize: 16, padding: 4 },
  categoryScroll: { maxHeight: 48, marginTop: Spacing.sm },
  categoryContent: { paddingHorizontal: Spacing.base, gap: Spacing.sm },
  categoryChip: {
    paddingHorizontal: Spacing.md, paddingVertical: 6,
    borderRadius: BorderRadius.full, backgroundColor: Colors.surfaceLight,
    borderWidth: 1, borderColor: Colors.surfaceBorder, marginRight: Spacing.sm,
  },
  categoryChipActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  categoryChipText: { fontSize: Fonts.sizes.xs, color: Colors.textSecondary },
  categoryChipTextActive: { color: Colors.white, fontWeight: '700' },
  defaultContent: { flex: 1, paddingTop: Spacing.base },
  section: { paddingHorizontal: Spacing.base, marginBottom: Spacing.xl },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.md },
  sectionTitle: { fontSize: Fonts.sizes.lg, fontWeight: '700', color: Colors.textPrimary, marginBottom: Spacing.md },
  clearAll: { color: Colors.primary, fontSize: Fonts.sizes.sm },
  historyItem: {
    flexDirection: 'row', alignItems: 'center', paddingVertical: Spacing.md,
    borderBottomWidth: 0.5, borderBottomColor: Colors.surfaceBorder,
  },
  historyIcon: { fontSize: 14, marginRight: Spacing.md },
  historyText: { flex: 1, color: Colors.textSecondary, fontSize: Fonts.sizes.md },
  historyArrow: { fontSize: 14 },
  tagsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm },
  trendingTag: {
    backgroundColor: Colors.surfaceLight, paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full, borderWidth: 1, borderColor: Colors.surfaceBorder,
  },
  trendingTagText: { color: Colors.primary, fontSize: Fonts.sizes.sm, fontWeight: '600' },
  popularItem: {
    flexDirection: 'row', alignItems: 'center', paddingVertical: Spacing.md,
    borderBottomWidth: 0.5, borderBottomColor: Colors.surfaceBorder,
  },
  popularRank: {
    width: 40, height: 40, borderRadius: 12, backgroundColor: Colors.surfaceLight,
    justifyContent: 'center', alignItems: 'center', marginRight: Spacing.md,
  },
  popularRankText: { fontSize: 18 },
  popularInfo: { flex: 1 },
  popularTitle: { color: Colors.textPrimary, fontSize: Fonts.sizes.md, fontWeight: '600' },
  popularAddress: { color: Colors.textMuted, fontSize: Fonts.sizes.xs, marginTop: 2 },
  popularLike: { color: Colors.textSecondary, fontSize: Fonts.sizes.sm },
  resultsList: { padding: Spacing.base },
  resultItem: {
    flexDirection: 'row', alignItems: 'center', paddingVertical: Spacing.md,
    borderBottomWidth: 0.5, borderBottomColor: Colors.surfaceBorder,
  },
  resultIcon: {
    width: 48, height: 48, borderRadius: BorderRadius.md,
    backgroundColor: Colors.surfaceLight, justifyContent: 'center', alignItems: 'center', marginRight: Spacing.md,
  },
  resultImage: {
    width: 48,
    height: 48,
    borderRadius: BorderRadius.md,
    marginRight: Spacing.md,
  },
  resultIconText: { fontSize: 22 },
  resultInfo: { flex: 1 },
  resultTitle: { color: Colors.textPrimary, fontSize: Fonts.sizes.base, fontWeight: '600' },
  resultAddress: { color: Colors.textMuted, fontSize: Fonts.sizes.xs, marginTop: 2 },
  resultMeta: { flexDirection: 'row', gap: Spacing.md, marginTop: 4 },
  resultLikes: { color: Colors.textSecondary, fontSize: Fonts.sizes.xs },
});
