import React, { useState, useCallback } from "react";
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Text,
  Modal,
  ActivityIndicator,
  Platform,
} from "react-native";
import * as Location from "expo-location";
import { Colors } from "../constants/theme";

// Only import maps on native platforms
let MapView: any = null;
let Marker: any = null;
let PROVIDER_GOOGLE: any = null;

if (Platform.OS !== "web") {
  const MapsModule = require("react-native-maps");
  MapView = MapsModule.default;
  Marker = MapsModule.Marker;
  PROVIDER_GOOGLE = MapsModule.PROVIDER_GOOGLE;
}

interface LocationPickerProps {
  visible: boolean;
  onLocationSelected: (
    latitude: number,
    longitude: number,
    address?: string,
  ) => void;
  onCancel: () => void;
  initialLat?: number;
  initialLng?: number;
}

export function LocationPicker({
  visible,
  onLocationSelected,
  onCancel,
  initialLat = 10.7769,
  initialLng = 106.7009,
}: LocationPickerProps) {
  const [selectedLocation, setSelectedLocation] = useState({
    latitude: initialLat,
    longitude: initialLng,
  });
  const [loading, setLoading] = useState(false);
  const [address, setAddress] = useState<string | undefined>();

  const handleMapPress = useCallback((event: any) => {
    const { latitude, longitude } = event.nativeEvent.coordinate;
    setSelectedLocation({ latitude, longitude });
    reverseGeocodeLocation(latitude, longitude);
  }, []);

  const reverseGeocodeLocation = async (lat: number, lng: number) => {
    try {
      setLoading(true);
      const result = await Location.reverseGeocodeAsync({
        latitude: lat,
        longitude: lng,
      });

      if (result.length > 0) {
        const { street, city, region } = result[0];
        const formattedAddress = [street, city, region]
          .filter(Boolean)
          .join(", ");
        setAddress(formattedAddress);
      }
    } catch (error) {
      console.error("Error reverse geocoding:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCurrentLocation = async () => {
    try {
      setLoading(true);
      const { status } = await Location.requestForegroundPermissionsAsync();

      if (status !== "granted") {
        alert("Permission to access location was denied");
        return;
      }

      const location = await Location.getCurrentPositionAsync({});
      const { latitude, longitude } = location.coords;

      setSelectedLocation({ latitude, longitude });
      reverseGeocodeLocation(latitude, longitude);
    } catch (error) {
      console.error("Error getting current location:", error);
      alert("Failed to get current location");
    } finally {
      setLoading(false);
    }
  };

  const handleConfirm = () => {
    onLocationSelected(
      selectedLocation.latitude,
      selectedLocation.longitude,
      address,
    );
  };

  // On web, show a message (the .web.tsx version will be used instead)
  if (Platform.OS === "web") {
    return (
      <Modal visible={visible} animationType="slide" transparent={false}>
        <View style={styles.container}>
          <Text>Location picker is only available on mobile devices</Text>
        </View>
      </Modal>
    );
  }

  // Native platforms
  if (!MapView) {
    return (
      <Modal visible={visible} animationType="slide" transparent={false}>
        <View style={styles.container}>
          <Text>Maps not available</Text>
        </View>
      </Modal>
    );
  }

  return (
    <Modal visible={visible} animationType="slide" transparent={false}>
      <View style={styles.container}>
        <MapView
          provider={PROVIDER_GOOGLE}
          style={styles.map}
          initialRegion={{
            latitude: selectedLocation.latitude,
            longitude: selectedLocation.longitude,
            latitudeDelta: 0.05,
            longitudeDelta: 0.05,
          }}
          onPress={handleMapPress}
        >
          {Marker && (
            <Marker coordinate={selectedLocation} pinColor={Colors.primary} />
          )}
        </MapView>

        {/* Address Display */}
        <View style={styles.addressContainer}>
          {loading ? (
            <ActivityIndicator color={Colors.primary} />
          ) : (
            <Text style={styles.addressText} numberOfLines={2}>
              {address || "Tap on map to select location"}
            </Text>
          )}
        </View>

        {/* Buttons */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[styles.button, styles.cancelButton]}
            onPress={onCancel}
          >
            <Text style={styles.cancelButtonText}>Hủy</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.currentButton]}
            onPress={handleCurrentLocation}
            disabled={loading}
          >
            <Text style={styles.buttonText}>📍 Vị trí hiện tại</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.confirmButton]}
            onPress={handleConfirm}
            disabled={loading}
          >
            <Text style={styles.buttonText}>✓ Xác nhận</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  map: {
    flex: 1,
  },
  addressContainer: {
    backgroundColor: Colors.card,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    minHeight: 50,
    justifyContent: "center",
  },
  addressText: {
    color: Colors.textPrimary,
    fontSize: 14,
    fontWeight: "500",
  },
  buttonContainer: {
    flexDirection: "row",
    paddingHorizontal: 16,
    paddingVertical: 16,
    gap: 8,
    backgroundColor: Colors.card,
  },
  button: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  cancelButton: {
    backgroundColor: Colors.border,
  },
  cancelButtonText: {
    color: Colors.textSecondary,
    fontSize: 14,
    fontWeight: "600",
  },
  currentButton: {
    backgroundColor: Colors.accent,
  },
  confirmButton: {
    backgroundColor: Colors.primary,
  },
  buttonText: {
    color: Colors.white,
    fontSize: 14,
    fontWeight: "600",
  },
});
