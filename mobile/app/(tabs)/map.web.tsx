import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Colors } from "../../constants/theme";

export default function MapScreen() {
  return (
    <View style={styles.container}>
      <View style={styles.messageContainer}>
        <Text style={styles.title}>🗺️ Maps Not Available</Text>
        <Text style={styles.message}>
          Map view is only available on mobile devices with the Expo Go app.
        </Text>
        <Text style={styles.subMessage}>
          Please use the mobile app to explore places on a map, or browse places
          in the main tab.
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: Colors.background,
    padding: 20,
  },
  messageContainer: {
    alignItems: "center",
    gap: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: Colors.textPrimary,
    marginBottom: 8,
  },
  message: {
    fontSize: 16,
    color: Colors.textPrimary,
    textAlign: "center",
  },
  subMessage: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: "center",
    marginTop: 8,
  },
});
