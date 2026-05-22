import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { usersAPI } from '../services/api';
import { useAuthStore } from '../stores/authStore';

// ===== MOCK DATA =====
const MOCK_USER_PROFILE = {
  id: 'u1',
  username: 'coffeeaddict',
  email: 'coffee@gmail.com',
  bio: '☕ Coffee explorer\n📍 Sài Gòn\n🌿 Finding peace in hidden spots',
  city: 'Hồ Chí Minh',
  avatar_url: null,
  is_private: false,
  created_at: '2024-06-01T00:00:00Z',
  followers_count: 892,
  following_count: 234,
  posts_count: 15,
  is_following: false,
};

const MOCK_MY_PROFILE = {
  id: 'me',
  username: 'explorer_vn',
  email: 'explorer@gmail.com',
  bio: '🌏 Khám phá Việt Nam\n📸 Chia sẻ hidden gems\n☕ Coffee lover',
  city: 'Hồ Chí Minh',
  avatar_url: null,
  is_private: false,
  created_at: '2024-01-15T00:00:00Z',
  followers_count: 1234,
  following_count: 567,
  posts_count: 42,
};

export type UserProfile = typeof MOCK_USER_PROFILE;

// Fetch another user's profile
export function useUserProfile(userId?: string) {
  return useQuery({
    queryKey: ['user', userId],
    queryFn: async () => {
      try {
        const { data } = await usersAPI.getProfile(userId!);
        return data as UserProfile;
      } catch {
        return { ...MOCK_USER_PROFILE, id: userId };
      }
    },
    enabled: !!userId,
  });
}

// Fetch current user's profile
export function useMyProfile() {
  const user = useAuthStore((s) => s.user);

  return useQuery({
    queryKey: ['user', 'me'],
    queryFn: async () => {
      try {
        if (user?.id) {
          const { data } = await usersAPI.getProfile(user.id);
          return data as typeof MOCK_MY_PROFILE;
        }
        return MOCK_MY_PROFILE;
      } catch {
        return {
          ...MOCK_MY_PROFILE,
          ...(user ? {
            id: user.id,
            username: user.username,
            email: user.email,
            bio: user.bio || MOCK_MY_PROFILE.bio,
            city: user.city || MOCK_MY_PROFILE.city,
            avatar_url: user.avatar_url,
          } : {}),
        };
      }
    },
    enabled: true,
  });
}

// Update profile mutation
export function useUpdateProfile() {
  const queryClient = useQueryClient();
  const setUser = useAuthStore((s) => s.setUser);

  return useMutation({
    mutationFn: (data: Record<string, any>) => usersAPI.updateProfile(data),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ['user', 'me'] });
      if (response.data) {
        setUser(response.data);
      }
    },
  });
}

// Update avatar mutation
export function useUpdateAvatar() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (formData: FormData) => usersAPI.updateAvatar(formData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user', 'me'] });
    },
  });
}

// Block user mutation
export function useBlockUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (userId: string) => usersAPI.blockUser(userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user'] });
      queryClient.invalidateQueries({ queryKey: ['users', 'blocked'] });
    },
  });
}

// Fetch list of blocked users
export function useBlockedUsers() {
  return useQuery({
    queryKey: ['users', 'blocked'],
    queryFn: async () => {
      try {
        const { data } = await usersAPI.getBlockedList();
        return data as any[];
      } catch {
        return [];
      }
    },
  });
}
