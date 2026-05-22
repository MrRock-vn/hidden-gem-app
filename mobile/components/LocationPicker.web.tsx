import React, { useState } from "react";
import { View, StyleSheet, TouchableOpacity, Text, Modal } from "react-native";
import { Colors } from "../constants/theme";

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

/**
 * Web version of LocationPicker
 * Shows a simple input for latitude/longitude instead of a map
 */
export function LocationPicker({
  visible,
  onLocationSelected,
  onCancel,
  initialLat = 10.7769,
  initialLng = 106.7009,
}: LocationPickerProps) {
  const [latitude, setLatitude] = useState(initialLat.toString());
  const [longitude, setLongitude] = useState(initialLng.toString());

  const handleSelect = () => {
    const lat = parseFloat(latitude);
    const lng = parseFloat(longitude);

    if (isNaN(lat) || isNaN(lng)) {
      alert("Please enter valid latitude and longitude");
      return;
    }

    onLocationSelected(lat, lng, `${lat}, ${lng}`);
  };

  if (!visible) return null;

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.container}>
        <View style={styles.content}>
          <Text style={styles.title}>Select Location</Text>
          <Text style={styles.subtitle}>Web version - Enter coordinates</Text>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Latitude:</Text>
            <input
              type="number"
              step="0.0001"
              value={latitude}
              onChange={(e) => setLatitude(e.target.value)}
              style={styles.input}
              placeholder="Enter latitude"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Longitude:</Text>
            <input
              type="number"
              step="0.0001"
              value={longitude}
              onChange={(e) => setLongitude(e.target.value)}
              style={styles.input}
              placeholder="Enter longitude"
            />
          </View>

          <View style={styles.buttonGroup}>
            <TouchableOpacity
              style={[styles.button, styles.cancelButton]}
              onPress={onCancel}
            >
              <Text style={styles.buttonText}>Cancel</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.button, styles.selectButton]}
              onPress={handleSelect}
            >
              <Text style={styles.buttonText}>Select</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  content: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 20,
    width: "90%",
    maxWidth: 400,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 8,
    color: Colors.text,
  },
  subtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 20,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 8,
    color: Colors.text,
  },
  input: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    fontFamily: "system-ui",
  },
  buttonGroup: {
    flexDirection: "row",
    gap: 12,
    marginTop: 24,
  },
  button: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  cancelButton: {
    backgroundColor: Colors.border,
  },
  selectButton: {
    backgroundColor: Colors.primary,
  },
  buttonText: {
    color: "white",
    fontWeight: "600",
    fontSize: 14,
  },
});
