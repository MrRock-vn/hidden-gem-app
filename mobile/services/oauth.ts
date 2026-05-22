import * as Google from "expo-auth-session/providers/google";
import * as AppleAuthentication from "expo-apple-authentication";
import { Platform } from "react-native";
import { authAPI } from "./api";
import * as SecureStore from "expo-secure-store";

/**
 * Google Sign-In Configuration
 */
const GOOGLE_CLIENT_ID_EXPO =
  process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID_EXPO || "";

/**
 * Google Sign-In
 * Returns access token for backend OAuth verification
 */
export async function signInWithGoogle(): Promise<string> {
  if (!GOOGLE_CLIENT_ID_EXPO) {
    throw new Error("EXPO_PUBLIC_GOOGLE_CLIENT_ID_EXPO not configured");
  }

  try {
    // Request user data from Google
    const response = await Google.useIdTokenAuthRequest({
      clientId: GOOGLE_CLIENT_ID_EXPO,
    });

    if (response.type === "success") {
      const { id_token } = response.params;
      console.log("[OAuth] Google sign-in successful, got ID token");
      return id_token;
    } else if (response.type === "error") {
      throw new Error(response.params.error || "Google sign-in failed");
    } else {
      throw new Error("Google sign-in cancelled");
    }
  } catch (error) {
    console.error("[OAuth] Google sign-in error:", error);
    throw error;
  }
}

/**
 * Apple Sign-In
 * Only available on iOS
 */
export async function signInWithApple(): Promise<string> {
  if (Platform.OS !== "ios") {
    throw new Error("Apple Sign-In only available on iOS");
  }

  try {
    if (!AppleAuthentication.isAvailable) {
      throw new Error("Apple Sign-In not available");
    }

    const credential = await AppleAuthentication.signInAsync({
      requestedScopes: [
        AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
        AppleAuthentication.AppleAuthenticationScope.EMAIL,
      ],
    });

    if (credential.identityToken) {
      console.log("[OAuth] Apple sign-in successful");
      return credential.identityToken;
    } else {
      throw new Error("No identity token received from Apple");
    }
  } catch (error) {
    if (error instanceof Error && error.message === "Canceled") {
      throw new Error("Apple sign-in cancelled");
    }
    console.error("[OAuth] Apple sign-in error:", error);
    throw error;
  }
}

/**
 * Verify OAuth token with backend and get JWT
 */
export async function verifyOAuthToken(
  provider: "google" | "apple",
  token: string,
): Promise<{ accessToken: string; refreshToken: string; user: any }> {
  try {
    const { data } = await authAPI.oauthVerify(provider, token);

    // Store tokens
    await SecureStore.setItemAsync("accessToken", data.accessToken);
    await SecureStore.setItemAsync("refreshToken", data.refreshToken);

    console.log(`[OAuth] ${provider} verification successful`);
    return data;
  } catch (error) {
    console.error(`[OAuth] ${provider} verification failed:`, error);
    throw error;
  }
}

/**
 * Check if device supports Apple Sign-In
 */
export function isAppleSignInAvailable(): boolean {
  return Platform.OS === "ios" && AppleAuthentication.isAvailable;
}

/**
 * Complete OAuth login flow
 */
export async function loginWithOAuth(
  provider: "google" | "apple",
): Promise<{ accessToken: string; refreshToken: string; user: any }> {
  try {
    // Step 1: Get OAuth token from provider
    let token: string;
    if (provider === "google") {
      token = await signInWithGoogle();
    } else if (provider === "apple") {
      token = await signInWithApple();
    } else {
      throw new Error(`Unknown OAuth provider: ${provider}`);
    }

    // Step 2: Verify token with backend
    const result = await verifyOAuthToken(provider, token);

    return result;
  } catch (error) {
    console.error(`[OAuth] ${provider} login failed:`, error);
    throw error;
  }
}
