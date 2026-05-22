import * as Notifications from "expo-notifications";
import * as Device from "expo-device";
import { Platform } from "react-native";
import api from "./api";

// Configure notification behavior when app is in foreground
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

/**
 * Register device for push notifications
 * Gets Expo Push Token and registers it with backend
 */
export async function registerForPushNotificationsAsync(): Promise<
  string | null
> {
  // Must use physical device for push notifications
  if (!Device.isDevice) {
    console.log(
      "[Notifications] Must use physical device for push notifications",
    );
    return null;
  }

  let token: string | undefined;

  // Get existing notification permissions
  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  // Request permissions if not already granted
  if (existingStatus !== "granted") {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== "granted") {
    console.warn("[Notifications] Failed to get push notification permissions");
    return null;
  }

  try {
    // Get Expo Push Token
    const pushTokenData = await Notifications.getExpoPushTokenAsync();
    token = pushTokenData.data;
    console.log("[Notifications] Got token:", token);
  } catch (error) {
    console.error("[Notifications] Error getting Expo push token:", error);
    return null;
  }

  // Setup Android notification channel
  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync("default", {
      name: "default",
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: "#FF231F7C",
    });
  }

  // Register token with backend
  if (token) {
    try {
      await api.post("/users/me/device-token", {
        token,
      });
      console.log("[Notifications] Device token registered with backend");
      return token;
    } catch (error) {
      console.error("[Notifications] Failed to register device token:", error);
      // Return token even if registration failed - might register later
      return token;
    }
  }

  return null;
}

/**
 * Setup notification event listeners
 * Handles notifications received while app is in foreground
 * Handles user tapping on notifications
 */
export function setupNotificationListeners(
  onNotificationReceived?: (notification: Notifications.Notification) => void,
  onNotificationTapped?: (data: Record<string, any>) => void,
): () => void {
  // Listener: Notification received while app is in foreground
  const foregroundListener = Notifications.addNotificationReceivedListener(
    (notification) => {
      console.log("[Notifications] Received notification:", {
        title: notification.request.content.title,
        body: notification.request.content.body,
        data: notification.request.content.data,
      });

      if (onNotificationReceived) {
        onNotificationReceived(notification);
      }
    },
  );

  // Listener: User taps on notification
  const tapListener = Notifications.addNotificationResponseReceivedListener(
    (response) => {
      const { notification } = response;
      const data = notification.request.content.data as Record<string, any>;

      console.log("[Notifications] User tapped notification:", {
        type: data?.type,
        timestamp: data?.timestamp,
      });

      if (onNotificationTapped) {
        onNotificationTapped(data);
      }
    },
  );

  // Return cleanup function
  return () => {
    foregroundListener.remove();
    tapListener.remove();
  };
}

export async function handleNotificationNavigation(
  data: Record<string, any>,
  navigation: any,
): Promise<void> {
  if (!data || !navigation) return;

  const { type, placeId, userId, conversationId, conversation_id } = data;
  const targetConversationId = conversationId || conversation_id;

  try {
    switch (type) {
      case "comment":
      case "like":
        // Navigate to place detail
        if (placeId) {
          navigation.push(`/place/${placeId}`);
        }
        break;

      case "follow":
        // Navigate to user profile
        if (userId) {
          navigation.push(`/user/${userId}`);
        }
        break;

      case "chat":
      case "message":
        // Navigate to chat room
        if (targetConversationId) {
          navigation.push(`/chat/${targetConversationId}`);
        } else if (userId) {
          navigation.push(`/chat`);
        }
        break;

      default:
        // Navigate to home if type unknown
        navigation.push("/(tabs)");
    }
  } catch (error) {
    console.error(
      "[Notifications] Error handling notification navigation:",
      error,
    );
  }
}

/**
 * Unregister device from push notifications
 */
export async function unregisterFromPushNotifications(): Promise<void> {
  try {
    await api.delete("/users/me/device-token");
    console.log("[Notifications] Device token unregistered");
  } catch (error) {
    console.error("[Notifications] Failed to unregister device token:", error);
  }
}

/**
 * Check if device has notification permissions granted
 */
export async function checkNotificationPermissions(): Promise<boolean> {
  const { status } = await Notifications.getPermissionsAsync();
  return status === "granted";
}

/**
 * Request notification permissions (if not already granted)
 */
export async function requestNotificationPermissions(): Promise<boolean> {
  const { status } = await Notifications.requestPermissionsAsync();
  return status === "granted";
}
