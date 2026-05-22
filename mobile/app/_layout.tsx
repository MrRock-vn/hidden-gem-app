import { useEffect, useState, useRef } from "react";
import { Stack, router, useSegments } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { View, ActivityIndicator, StyleSheet } from "react-native";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import * as Notifications from "expo-notifications";
import { useAuthStore } from "../stores/authStore";
import { useThemeStore } from "../stores/themeStore";
import { Colors } from "../constants/theme";
import {
  registerForPushNotificationsAsync,
  setupNotificationListeners,
  handleNotificationNavigation,
} from "../services/notifications";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      staleTime: 5 * 60 * 1000, // 5 minutes
      refetchOnWindowFocus: false,
    },
  },
});

function useProtectedRoute() {
  const { isAuthenticated, isLoading } = useAuthStore();
  const segments = useSegments();

  useEffect(() => {
    if (isLoading) return; // Still loading, don't redirect

    const inAuthGroup = segments[0] === "(auth)";

    if (!isAuthenticated && !inAuthGroup) {
      // Not signed in and not in auth group → redirect to login
      router.replace("/(auth)/login");
    } else if (isAuthenticated && inAuthGroup) {
      // Signed in and in auth group → redirect to home
      router.replace("/(tabs)");
    }
  }, [isAuthenticated, isLoading, segments]);
}

export default function RootLayout() {
  const loadUser = useAuthStore((state) => state.loadUser);
  const isLoading = useAuthStore((state) => state.isLoading);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const loadTheme = useThemeStore((state) => state.loadTheme);
  const themeColors = useThemeStore((state) => state.colors);
  const [notificationsReady, setNotificationsReady] = useState(false);

  // Track the last notification the user tapped (handles Cold Start)
  const lastNotificationResponse = Notifications.useLastNotificationResponse();
  // Ref to avoid re-navigating on re-renders for the same notification
  const handledNotificationId = useRef<string | null>(null);

  useEffect(() => {
    // Load cả auth lẫn theme cùng lúc
    Promise.all([loadUser(), loadTheme()]);
  }, []);

  // Handle Cold Start: when app launched from a tapped notification
  // We wait until auth is fully loaded before navigating
  useEffect(() => {
    if (!lastNotificationResponse) return;
    if (isLoading) return; // Wait for auth to finish loading
    if (!isAuthenticated) return; // Must be logged in to navigate

    const notifId = lastNotificationResponse.notification.request.identifier;
    if (handledNotificationId.current === notifId) return; // Already handled
    handledNotificationId.current = notifId;

    const data = lastNotificationResponse.notification.request.content
      .data as Record<string, any>;

    console.log("[App] Handling Cold Start notification tap:", {
      type: data?.type,
      conversationId: data?.conversationId || data?.conversation_id,
    });

    // Small delay to let the navigation stack initialize
    setTimeout(() => {
      handleNotificationNavigation(data, router);
    }, 300);
  }, [lastNotificationResponse, isLoading, isAuthenticated]);

  // Setup push notifications after user is authenticated
  useEffect(() => {
    if (isAuthenticated && !notificationsReady) {
      setupPushNotifications();
      setNotificationsReady(true);
    }
  }, [isAuthenticated, notificationsReady]);

  async function setupPushNotifications() {
    try {
      // Register device for push notifications
      await registerForPushNotificationsAsync();

      // Setup notification listeners
      const unsubscribe = setupNotificationListeners(
        (notification) => {
          // Handle notification received while app in foreground
          console.log("[App] Notification received in foreground");
        },
        (data) => {
          // Handle user tapping notification while app is open/backgrounded
          handleNotificationNavigation(data, router);
        },
      );

      return () => {
        unsubscribe?.();
      };
    } catch (error) {
      console.error("[App] Error setting up notifications:", error);
    }
  }

  const isDark = useThemeStore((state) => state.isDark);

  useProtectedRoute();

  // Show splash while loading auth state
  if (isLoading) {
    return (
      <View style={styles.splash}>
        <StatusBar style={isDark ? "light" : "dark"} />
        <ActivityIndicator size="large" color={themeColors.primary} />
      </View>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <StatusBar style={isDark ? "light" : "dark"} />
      <Stack
        key={isDark ? "dark" : "light"}
        screenOptions={{
          headerStyle: {
            backgroundColor: themeColors.background,
          },
          headerTintColor: themeColors.textPrimary,
          headerTitleStyle: {
            fontWeight: "700",
          },
          contentStyle: {
            backgroundColor: themeColors.background,
          },
          animation: "slide_from_right",
        }}
      >
        <Stack.Screen name="(auth)" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen
          name="place/[id]"
          options={{
            headerShown: false,
            animation: "slide_from_bottom",
          }}
        />
        <Stack.Screen
          name="place/create"
          options={{
            title: "Đăng địa điểm mới",
            presentation: "modal",
          }}
        />
        <Stack.Screen
          name="place/comments/[id]"
          options={{
            title: "Bình luận",
            presentation: "modal",
          }}
        />
        <Stack.Screen
          name="user/[id]"
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="user/following"
          options={{
            title: "Đang theo dõi",
          }}
        />
        <Stack.Screen
          name="bookmarks/index"
          options={{
            title: "Bộ sưu tập",
          }}
        />
        <Stack.Screen
          name="settings/index"
          options={{
            title: "Cài đặt",
          }}
        />
        <Stack.Screen
          name="settings/edit-profile"
          options={{
            title: "Chỉnh sửa hồ sơ",
          }}
        />
        <Stack.Screen
          name="settings/blocked"
          options={{
            title: "Danh sách chặn",
          }}
        />
        <Stack.Screen
          name="chat/index"
          options={{
            title: "Tin nhắn",
          }}
        />
        <Stack.Screen
          name="chat/[id]"
          options={{
            title: "Trò chuyện",
          }}
        />
        <Stack.Screen name="+not-found" />
      </Stack>
    </QueryClientProvider>
  );
}

const styles = StyleSheet.create({
  splash: {
    flex: 1,
    backgroundColor: Colors.background,
    justifyContent: "center",
    alignItems: "center",
  },
});
