import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  Image,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import * as Location from "expo-location";
import { router, useLocalSearchParams } from "expo-router";
import MapView, { Marker, PROVIDER_GOOGLE, Region } from "react-native-maps";
import { Colors, Spacing, BorderRadius, Fonts, Categories } from "../../constants/theme";
import { Place, usePlaces } from "../../hooks/usePlaces";
import { getMediaUrl } from "../../utils/media";

const HCMC_REGION: Region = {
  latitude: 10.7769,
  longitude: 106.7009,
  latitudeDelta: 0.08,
  longitudeDelta: 0.08,
};

const categoryColors: Record<string, string> = {
  cafe: "#C07F00",
  food: "#E74C3C",
  photo: "#9B59B6",
  nature: "#27AE60",
  art: "#F39C12",
  nightlife: "#2C3E50",
  shopping: "#E91E63",
  historic: "#795548",
  beach: "#00BCD4",
  other: "#607D8B",
};

export default function MapScreen() {
  const { placeId } = useLocalSearchParams<{ placeId?: string }>();
  const mapRef = useRef<MapView | null>(null);
  const { data: places = [], isLoading, refetch } = usePlaces({ page: 1, limit: 50 });
  const [region, setRegion] = useState<Region>(HCMC_REGION);
  const [selectedPlace, setSelectedPlace] = useState<Place | null>(null);
  const [locationMessage, setLocationMessage] = useState<string | null>(null);

  const mappablePlaces = useMemo(
    () =>
      places.filter(
        (place) =>
          Number.isFinite(Number(place.latitude)) &&
          Number.isFinite(Number(place.longitude)),
      ),
    [places],
  );

  useEffect(() => {
    requestCurrentLocation();
  }, []);

  const requestCurrentLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        setLocationMessage("Chua cap quyen vi tri, dang hien thi khu vuc TP.HCM");
        return;
      }

      const location = await Location.getCurrentPositionAsync({});
      const nextRegion = {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        latitudeDelta: 0.05,
        longitudeDelta: 0.05,
      };
      setRegion(nextRegion);
      mapRef.current?.animateToRegion(nextRegion, 500);
      setLocationMessage(null);
    } catch {
      setLocationMessage("Khong the lay vi tri hien tai");
    }
  };

  const focusPlace = (place: Place) => {
    const nextRegion = {
      latitude: Number(place.latitude),
      longitude: Number(place.longitude),
      latitudeDelta: 0.025,
      longitudeDelta: 0.025,
    };
    setSelectedPlace(place);
    setRegion(nextRegion);
    mapRef.current?.animateToRegion(nextRegion, 350);
  };

  useEffect(() => {
    if (placeId && places.length > 0) {
      const targetPlace = places.find((p) => p.id === placeId);
      if (targetPlace) {
        const timer = setTimeout(() => {
          focusPlace(targetPlace);
        }, 600);
        return () => clearTimeout(timer);
      }
    }
  }, [placeId, places]);

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        provider={Platform.OS === "android" ? PROVIDER_GOOGLE : undefined}
        style={styles.map}
        initialRegion={region}
        onRegionChangeComplete={setRegion}
        onPress={() => setSelectedPlace(null)}
        showsUserLocation
        showsMyLocationButton={false}
      >
        {mappablePlaces.map((place) => {
          const category = Categories.find((item) => item.id === place.category);
          return (
            <Marker
              key={place.id}
              coordinate={{
                latitude: Number(place.latitude),
                longitude: Number(place.longitude),
              }}
              title={place.title}
              description={place.address}
              pinColor={categoryColors[place.category] || Colors.primary}
              onPress={() => focusPlace(place)}
            >
              <View
                style={[
                  styles.marker,
                  { backgroundColor: categoryColors[place.category] || Colors.primary },
                ]}
              >
                <Text style={styles.markerText}>{category?.icon || "P"}</Text>
              </View>
            </Marker>
          );
        })}
      </MapView>

      <View style={styles.header}>
        <Text style={styles.title}>Ban do dia diem</Text>
        <Text style={styles.subtitle}>{mappablePlaces.length} dia diem</Text>
      </View>

      <View style={styles.actions}>
        <TouchableOpacity style={styles.iconButton} onPress={requestCurrentLocation}>
          <Text style={styles.iconButtonText}>⌖</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.iconButton} onPress={() => refetch()}>
          <Text style={styles.iconButtonText}>↻</Text>
        </TouchableOpacity>
      </View>

      {locationMessage && (
        <View style={styles.message}>
          <Text style={styles.messageText}>{locationMessage}</Text>
        </View>
      )}

      {isLoading && (
        <View style={styles.loading}>
          <ActivityIndicator color={Colors.primary} />
          <Text style={styles.loadingText}>Dang tai ban do...</Text>
        </View>
      )}

      {selectedPlace && (
        <TouchableOpacity
          activeOpacity={0.92}
          style={styles.placeCard}
          onPress={() => router.push(`/place/${selectedPlace.id}`)}
        >
          {getMediaUrl(selectedPlace.images?.[0]?.url) ? (
            <Image
              source={{ uri: getMediaUrl(selectedPlace.images?.[0]?.url)! }}
              style={styles.placeImage}
            />
          ) : (
            <View
              style={[
                styles.placeImageFallback,
                {
                  backgroundColor:
                    categoryColors[selectedPlace.category] || Colors.surfaceLight,
                },
              ]}
            >
              <Text style={styles.placeImageFallbackText}>
                {Categories.find((item) => item.id === selectedPlace.category)?.icon || "P"}
              </Text>
            </View>
          )}

          <View style={styles.placeInfo}>
            <Text style={styles.placeTitle} numberOfLines={1}>
              {selectedPlace.title}
            </Text>
            <Text style={styles.placeAddress} numberOfLines={1}>
              {selectedPlace.address || "Chua co dia chi"}
            </Text>
            <View style={styles.placeStats}>
              <Text style={styles.placeStat}>♥ {selectedPlace.like_count || 0}</Text>
              <Text style={styles.placeStat}>● {selectedPlace.comment_count || 0}</Text>
              <Text style={styles.placeOpen}>Mo chi tiet</Text>
            </View>
          </View>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  header: {
    position: "absolute",
    top: 54,
    left: Spacing.base,
    right: 92,
    backgroundColor: Colors.backgroundLight,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.surfaceBorder,
    padding: Spacing.md,
  },
  title: {
    color: Colors.textPrimary,
    fontSize: Fonts.sizes.lg,
    fontWeight: "800",
  },
  subtitle: {
    color: Colors.textSecondary,
    fontSize: Fonts.sizes.sm,
    marginTop: 2,
  },
  actions: {
    position: "absolute",
    top: 54,
    right: Spacing.base,
    gap: Spacing.sm,
  },
  iconButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.backgroundLight,
    borderWidth: 1,
    borderColor: Colors.surfaceBorder,
    alignItems: "center",
    justifyContent: "center",
  },
  iconButtonText: {
    color: Colors.textPrimary,
    fontSize: 22,
    fontWeight: "800",
  },
  marker: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: Colors.white,
  },
  markerText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: "800",
  },
  message: {
    position: "absolute",
    top: 134,
    left: Spacing.base,
    right: Spacing.base,
    backgroundColor: Colors.backgroundLight,
    borderRadius: BorderRadius.md,
    padding: Spacing.sm,
  },
  messageText: {
    color: Colors.warning,
    fontSize: Fonts.sizes.sm,
    textAlign: "center",
  },
  loading: {
    position: "absolute",
    alignSelf: "center",
    top: "48%",
    backgroundColor: Colors.backgroundLight,
    borderRadius: BorderRadius.md,
    padding: Spacing.base,
    alignItems: "center",
  },
  loadingText: {
    color: Colors.textSecondary,
    marginTop: Spacing.sm,
  },
  placeCard: {
    position: "absolute",
    left: Spacing.base,
    right: Spacing.base,
    bottom: 104,
    flexDirection: "row",
    backgroundColor: Colors.backgroundLight,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.surfaceBorder,
    overflow: "hidden",
  },
  placeImage: {
    width: 96,
    height: 96,
  },
  placeImageFallback: {
    width: 96,
    height: 96,
    alignItems: "center",
    justifyContent: "center",
  },
  placeImageFallbackText: {
    color: Colors.white,
    fontSize: 26,
  },
  placeInfo: {
    flex: 1,
    padding: Spacing.md,
  },
  placeTitle: {
    color: Colors.textPrimary,
    fontSize: Fonts.sizes.base,
    fontWeight: "800",
  },
  placeAddress: {
    color: Colors.textSecondary,
    fontSize: Fonts.sizes.sm,
    marginTop: 4,
  },
  placeStats: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: "auto",
    gap: Spacing.md,
  },
  placeStat: {
    color: Colors.textMuted,
    fontSize: Fonts.sizes.sm,
  },
  placeOpen: {
    color: Colors.primary,
    fontSize: Fonts.sizes.sm,
    fontWeight: "700",
    marginLeft: "auto",
  },
});
