import axios from "axios";
import * as SecureStore from "expo-secure-store";
import { API_URL } from "../constants/theme";

const api = axios.create({
  baseURL: API_URL,
  timeout: 15000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor - attach JWT token
api.interceptors.request.use(
  async (config) => {
    try {
      if (config.data instanceof FormData) {
        delete config.headers["Content-Type"];
      }

      const token = await SecureStore.getItemAsync("accessToken");
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (error) {
      console.log("Error getting token:", error);
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// Response interceptor - handle token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = await SecureStore.getItemAsync("refreshToken");
        if (!refreshToken) {
          // No refresh token, redirect to login
          await SecureStore.deleteItemAsync("accessToken");
          await SecureStore.deleteItemAsync("refreshToken");
          return Promise.reject(error);
        }

        const { data } = await axios.post(`${API_URL}/auth/refresh`, {
          refreshToken,
        });

        await SecureStore.setItemAsync("accessToken", data.accessToken);
        await SecureStore.setItemAsync("refreshToken", data.refreshToken);

        originalRequest.headers.Authorization = `Bearer ${data.accessToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        await SecureStore.deleteItemAsync("accessToken");
        await SecureStore.deleteItemAsync("refreshToken");
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  },
);

export default api;

// ===== AUTH API =====
export const authAPI = {
  register: (data: { username: string; email: string; password: string }) =>
    api.post("/auth/register", data),
  login: (data: { email: string; password: string }) =>
    api.post("/auth/login", data),
  googleAuth: (token: string) => api.post("/auth/google", { token }),
  oauthVerify: (provider: "google" | "apple", token: string) =>
    api.post(`/auth/${provider}`, { token }),
  refreshToken: (refreshToken: string) =>
    api.post("/auth/refresh", { refreshToken }),
  logout: () => api.post("/auth/logout"),
};

// ===== PLACES API =====
export const placesAPI = {
  getAll: (params?: Record<string, any>) => api.get("/places", { params }),
  getById: (id: string) => api.get(`/places/${id}`),
  getNearby: (lat: number, lng: number, radius?: number) =>
    api.get("/places/nearby", { params: { lat, lng, radius } }),
  create: (formData: FormData) => api.post("/places", formData),
  toggleLike: (placeId: string) => api.post(`/places/${placeId}/like`),
  toggleBookmark: (placeId: string) => api.post(`/places/${placeId}/bookmark`),
  delete: (placeId: string) => api.delete(`/places/${placeId}`),
  getUserPlaces: (userId: string, page?: number) =>
    api.get(`/places/user/${userId}`, { params: { page } }),
};
// ===== SOCIAL API =====
export const socialAPI = {
  getComments: (placeId: string, page?: number) =>
    api.get(`/places/${placeId}/comments`, { params: { page } }),
  createComment: (
    placeId: string,
    data: { content: string; parent_id?: string; mentioned_usernames?: string[] },
  ) => api.post(`/places/${placeId}/comments`, data),
  deleteComment: (commentId: string) => api.delete(`/comments/${commentId}`),
  likeComment: (commentId: string) => api.post(`/comments/${commentId}/like`),
  followUser: (userId: string) => api.post(`/users/${userId}/follow`),
  unfollowUser: (userId: string) => api.delete(`/users/${userId}/follow`),
  getFollowers: (userId: string, page?: number) =>
    api.get(`/users/${userId}/followers`, { params: { page } }),
  getFollowing: (userId: string, page?: number) =>
    api.get(`/users/${userId}/following`, { params: { page } }),
};

// ===== USERS API =====
export const usersAPI = {
  getMe: () => api.get("/users/me"),
  getProfile: (userId: string) => api.get(`/users/${userId}`),
  updateProfile: (data: Record<string, any>) => api.patch("/users/me", data),
  getSettings: () => api.get("/users/me/settings"),
  updateSettings: (data: Record<string, any>) =>
    api.patch("/users/me/settings", data),
  updateEmail: (email: string) => api.patch("/users/me/email", { email }),
  updatePassword: (data: { currentPassword: string; newPassword: string }) =>
    api.patch("/users/me/password", data),
  updateAvatar: (formData: FormData) => api.post("/users/me/avatar", formData),
  blockUser: (userId: string) => api.post(`/users/${userId}/block`),
  getBlockedList: () => api.get("/users/me/blocks"),
  deleteMe: () => api.delete("/users/me"),
};

// ===== BOOKMARKS API =====
export const bookmarksAPI = {
  getCollections: () => api.get("/users/me/bookmarks"),
  createCollection: (name: string, isPublic?: boolean) =>
    api.post("/bookmarks/collections", { name, is_public: isPublic }),
  addPlace: (collectionId: string, placeId: string) =>
    api.post(`/bookmarks/collections/${collectionId}/places`, {
      place_id: placeId,
    }),
  removePlace: (collectionId: string, placeId: string) =>
    api.delete(`/bookmarks/collections/${collectionId}/places/${placeId}`),
  deleteCollection: (collectionId: string) =>
    api.delete(`/bookmarks/collections/${collectionId}`),
};

// ===== NOTIFICATIONS API =====
export const notificationsAPI = {
  getAll: (page?: number, unread?: boolean) =>
    api.get("/notifications", { params: { page, unread } }),
  markAsRead: (ids?: string[]) =>
    api.patch("/notifications/read", { notification_ids: ids }),
  delete: (id: string) => api.delete(`/notifications/${id}`),
};

// ===== SEARCH API =====
export const searchAPI = {
  search: (q: string, filters?: Record<string, any>) =>
    api.get("/search", { params: { q, ...filters } }),
};

// ===== CHAT API =====
export const chatAPI = {
  getConversations: () => api.get("/chat/conversations"),
  getOrCreateConversation: (recipientId: string) =>
    api.post("/chat/conversations", { recipientId }),
  getMessages: (conversationId: string, page?: number, limit?: number) =>
    api.get(`/chat/conversations/${conversationId}/messages`, {
      params: { page, limit },
    }),
  sendMessage: (conversationId: string, content?: string, imageUrl?: string) =>
    api.post(`/chat/conversations/${conversationId}/messages`, { content, imageUrl }),
  uploadImage: (formData: FormData) =>
    api.post("/chat/upload", formData),
};

