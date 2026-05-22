import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { socialAPI } from '../services/api';

// ===== MOCK DATA =====
const MOCK_COMMENTS = [
  {
    id: 'c1',
    content: 'Quán này đẹp quá! Mình sẽ ghé thử cuối tuần 🤩',
    like_count: 12,
    is_liked: false,
    created_at: '2025-04-17T09:00:00Z',
    user: { id: 'u1', username: 'traveler_sg', avatar_url: null },
    replies: [
      {
        id: 'c1r1',
        content: 'Nhớ thử espresso tonic nhé, bestseller luôn ☕',
        like_count: 5,
        is_liked: false,
        created_at: '2025-04-17T09:30:00Z',
        user: { id: 'u2', username: 'coffeeaddict', avatar_url: null },
      },
    ],
  },
  {
    id: 'c2',
    content: 'Không gian yên tĩnh, phù hợp làm việc remote. Wifi mạnh nữa 💪',
    like_count: 8,
    is_liked: false,
    created_at: '2025-04-16T15:00:00Z',
    user: { id: 'u3', username: 'digital_nomad', avatar_url: null },
    replies: [],
  },
  {
    id: 'c3',
    content: 'Mình qua buổi tối thì hơi tối, nhưng vibes chill phết 🌙',
    like_count: 3,
    is_liked: false,
    created_at: '2025-04-15T20:00:00Z',
    user: { id: 'u4', username: 'nightowl_vn', avatar_url: null },
    replies: [],
  },
];

export type Comment = typeof MOCK_COMMENTS[0];

const MOCK_USERS = [
  { id: 'u1', username: 'coffeeaddict', bio: '☕ Coffee explorer', avatar_url: null, is_following: true },
  { id: 'u2', username: 'photohunter', bio: '📸 Street photographer', avatar_url: null, is_following: true },
  { id: 'u3', username: 'foodielover', bio: '🍜 Ẩm thực Việt Nam', avatar_url: null, is_following: true },
  { id: 'u4', username: 'naturelover', bio: '🌿 Nature & peace', avatar_url: null, is_following: false },
  { id: 'u5', username: 'explorer_sg', bio: '🌏 Sài Gòn explorer', avatar_url: null, is_following: true },
];

export type FollowUser = typeof MOCK_USERS[0];

function adjustPlaceCommentCount(queryClient: ReturnType<typeof useQueryClient>, placeId: string, delta: number) {
  queryClient.setQueryData(['place', placeId], (oldData: any) => {
    if (!oldData) return oldData;
    return {
      ...oldData,
      comment_count: Math.max((oldData.comment_count || 0) + delta, 0),
    };
  });

  queryClient.setQueriesData({ queryKey: ['places'] }, (oldData: any) => {
    if (!oldData) return oldData;

    const updatePlace = (place: any) =>
      place?.id === placeId
        ? { ...place, comment_count: Math.max((place.comment_count || 0) + delta, 0) }
        : place;

    if (Array.isArray(oldData)) {
      return oldData.map(updatePlace);
    }

    if (oldData.pages) {
      return {
        ...oldData,
        pages: oldData.pages.map((page: any) => ({
          ...page,
          places: Array.isArray(page.places) ? page.places.map(updatePlace) : page.places,
        })),
      };
    }

    return oldData;
  });
}

// Fetch comments for a place
export function useComments(placeId: string | undefined) {
  return useQuery({
    queryKey: ['comments', placeId],
    queryFn: async () => {
      try {
        const response = await socialAPI.getComments(placeId!);
        const responseData = response.data;
        return (responseData?.data || responseData) as Comment[];
      } catch (error) {
        if (!__DEV__) throw error;
        return MOCK_COMMENTS;
      }
    },
    enabled: !!placeId,
  });
}

// Create comment mutation
export function useCreateComment(placeId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (commentData: { content: string; parent_id?: string; mentioned_usernames?: string[] }) =>
      socialAPI.createComment(placeId, commentData),
    onSuccess: () => {
      adjustPlaceCommentCount(queryClient, placeId, 1);
      queryClient.invalidateQueries({ queryKey: ['comments', placeId] });
      queryClient.invalidateQueries({ queryKey: ['place', placeId] });
      queryClient.invalidateQueries({ queryKey: ['places'] });
    },
  });
}

// Delete comment mutation
export function useDeleteComment(placeId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (commentId: string) => socialAPI.deleteComment(commentId),
    onSuccess: () => {
      adjustPlaceCommentCount(queryClient, placeId, -1);
      queryClient.invalidateQueries({ queryKey: ['comments', placeId] });
      queryClient.invalidateQueries({ queryKey: ['place', placeId] });
      queryClient.invalidateQueries({ queryKey: ['places'] });
    },
  });
}

// Like comment mutation
export function useLikeComment(placeId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (commentId: string) => socialAPI.likeComment(commentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['comments', placeId] });
    },
  });
}

// Toggle follow mutation
export function useToggleFollow() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ userId, isFollowing }: { userId: string; isFollowing: boolean }) => {
      if (isFollowing) {
        return socialAPI.unfollowUser(userId);
      }
      return socialAPI.followUser(userId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['followers'] });
      queryClient.invalidateQueries({ queryKey: ['following'] });
      queryClient.invalidateQueries({ queryKey: ['user'] });
    },
  });
}

// Fetch followers
export function useFollowers(userId?: string) {
  return useQuery({
    queryKey: ['followers', userId],
    queryFn: async () => {
      try {
        const response = await socialAPI.getFollowers(userId!);
        const responseData = response.data;
        return (responseData?.data || responseData) as FollowUser[];
      } catch (error) {
        if (!__DEV__) throw error;
        return MOCK_USERS;
      }
    },
    enabled: !!userId,
  });
}

// Fetch following
export function useFollowing(userId?: string) {
  return useQuery({
    queryKey: ['following', userId],
    queryFn: async () => {
      try {
        const response = await socialAPI.getFollowing(userId!);
        const responseData = response.data;
        return (responseData?.data || responseData) as FollowUser[];
      } catch (error) {
        if (!__DEV__) throw error;
        return MOCK_USERS;
      }
    },
    enabled: !!userId,
  });
}
