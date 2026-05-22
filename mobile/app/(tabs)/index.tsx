import React, { useState, useCallback, useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
  ActivityIndicator,
} from "react-native";
import { router } from "expo-router";
import * as Location from "expo-location";
import { usePlacesInfinite, useToggleLike, useToggleBookmark } from "../../hooks/usePlaces";
import PlaceCard from "../../components/PlaceCard";
import PlaceCardSkeleton from "../../components/PlaceCardSkeleton";
import CategoryFilter from "../../components/CategoryFilter";
import LoadingScreen from "../../components/LoadingScreen";
import EmptyState from "../../components/EmptyState";
import {
  Colors,
  Spacing,
  BorderRadius,
  Fonts,
} from "../../constants/theme";

export default function HomeFeedScreen() {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [nearbyMode, setNearbyMode] = useState(false);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);

  const {
    data,
    isLoading,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
    refetch,
    isRefetching,
    error,
  } = usePlacesInfinite(
    nearbyMode && userLocation
      ? { category: selectedCategory || undefined, lat: userLocation.lat, lng: userLocation.lng, radius: 50 }
      : selectedCategory ? { category: selectedCategory } : undefined,
  );

  const toggleLikeMutation = useToggleLike();
  const toggleBookmarkMutation = useToggleBookmark();

  // Request location permission
  useEffect(() => {
    requestLocationPermission();
  }, []);

  const requestLocationPermission = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === "granted") {
        const location = await Location.getCurrentPositionAsync({});
        setUserLocation({
          lat: location.coords.latitude,
          lng: location.coords.longitude,
        });
      } else {
        setLocationError("Cần cấp quyền vị trí để sử dụng tính năng này");
      }
    } catch (err) {
      setLocationError("Không thể lấy vị trí của bạn");
    }
  };

  const handleLike = useCallback(
    (placeId: string) => {
      toggleLikeMutation.mutate(placeId);
    },
    [toggleLikeMutation],
  );

  const handleBookmark = useCallback(
    (placeId: string) => {
      toggleBookmarkMutation.mutate(placeId);
    },
    [toggleBookmarkMutation],
  );

  const handleEndReached = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  const places = data?.pages.flatMap((page) => page.places) || [];

  if (isLoading) {
    return <LoadingScreen message="Đang tải bài viết..." />;
  }

  const renderFooter = () => {
    if (!isFetchingNextPage) return null;
    return (
      <View style={styles.loadingFooter}>
        <ActivityIndicator size="small" color={Colors.primary} />
        <Text style={styles.loadingText}>Đang tải thêm...</Text>
      </View>
    );
  };

  const renderSkeletons = () => {
    return Array(3)
      .fill(0)
      .map((_, i) => <PlaceCardSkeleton key={`skeleton-loading-${i}`} />);
  };

  return (
    <View style={styles.container}>
      {/* Category & Location Filter */}
      <CategoryFilter
        selectedCategory={selectedCategory}
        nearbyMode={nearbyMode}
        userLocation={userLocation}
        onCategoryChange={(cat) => {
          setSelectedCategory(cat);
          setNearbyMode(false);
        }}
        onNearbyToggle={() => setNearbyMode(!nearbyMode)}
        onRequestLocation={requestLocationPermission}
      />

      {/* Error message */}
      {error && (
        <View style={styles.errorBanner}>
          <Text style={styles.errorText}>⚠️ Lỗi tải dữ liệu. Thử lại?</Text>
          <TouchableOpacity onPress={() => refetch()}>
            <Text style={styles.errorRetry}>Thử lại</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Location error */}
      {nearbyMode && locationError && (
        <View style={styles.errorBanner}>
          <Text style={styles.errorText}>{locationError}</Text>
        </View>
      )}

      {/* Place List */}
      <FlatList
        data={places || []}
        renderItem={({ item }) => (
          <PlaceCard
            place={item}
            onLike={() => handleLike(item.id)}
            onBookmark={() => handleBookmark(item.id)}
          />
        )}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        onEndReached={handleEndReached}
        onEndReachedThreshold={0.5}
        ListFooterComponent={
          isFetchingNextPage ? (
            <View style={styles.skeletonsContainer}>
              {renderSkeletons()}
            </View>
          ) : (
            renderFooter()
          )
        }
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={refetch}
            tintColor={Colors.primary}
            colors={[Colors.primary]}
          />
        }
        ListEmptyComponent={
          !isFetchingNextPage ? (
            <EmptyState
              icon="🔍"
              title="Chưa có địa điểm nào"
              message="Hãy là người đầu tiên chia sẻ!"
              actionLabel="Đăng địa điểm"
              onAction={() => router.push("/place/create")}
            />
          ) : null
        }
      />

      {/* FAB - Create Place */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => router.push("/place/create")}
        activeOpacity={0.8}
      >
        <Text style={styles.fabIcon}>+</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  errorBanner: {
    backgroundColor: "#FF6B6B",
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.sm,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  errorText: {
    color: Colors.white,
    fontSize: Fonts.sizes.sm,
    flex: 1,
  },
  errorRetry: {
    color: Colors.white,
    fontWeight: "600",
    marginLeft: Spacing.base,
  },
  listContent: { padding: Spacing.base, paddingBottom: 100 },
  skeletonsContainer: { padding: Spacing.base, paddingBottom: 100 },
  fab: {
    position: "absolute",
    bottom: 100,
    right: Spacing.xl,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.primary,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 8,
  },
  fabIcon: {
    color: Colors.white,
    fontSize: 28,
    fontWeight: "300",
    marginTop: -2,
  },
  loadingFooter: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: Spacing.lg,
    gap: Spacing.base,
  },
  loadingText: {
    color: Colors.textSecondary,
    fontSize: Fonts.sizes.sm,
  },
});
