import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { bookmarksAPI } from '../services/api';

// ===== MOCK DATA =====
const MOCK_COLLECTIONS = [
  {
    id: '1',
    name: 'Quán cà phê yêu thích',
    place_count: 12,
    is_public: true,
    preview_icons: ['☕', '🏪', '☕', '🏠'],
    places: [],
    created_at: '2025-01-01T00:00:00Z',
  },
  {
    id: '2',
    name: 'Góc chụp ảnh',
    place_count: 8,
    is_public: false,
    preview_icons: ['📸', '🌅', '📸', '🌆'],
    places: [],
    created_at: '2025-02-01T00:00:00Z',
  },
  {
    id: '3',
    name: 'Ẩm thực đường phố',
    place_count: 15,
    is_public: true,
    preview_icons: ['🍜', '🍲', '🍢', '🍜'],
    places: [],
    created_at: '2025-03-01T00:00:00Z',
  },
  {
    id: '4',
    name: 'Thiên nhiên & chill',
    place_count: 5,
    is_public: false,
    preview_icons: ['🌿', '🏞️', '🌳', '🌿'],
    places: [],
    created_at: '2025-04-01T00:00:00Z',
  },
];

export type BookmarkCollection = typeof MOCK_COLLECTIONS[0];

// Fetch all collections
export function useCollections() {
  return useQuery({
    queryKey: ['collections'],
    queryFn: async () => {
      try {
        const response = await bookmarksAPI.getCollections();
        return (response.data?.data || response.data) as BookmarkCollection[];
      } catch (error) {
        if (!__DEV__) throw error;
        return MOCK_COLLECTIONS;
      }
    },
  });
}

// Create collection
export function useCreateCollection() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ name, isPublic }: { name: string; isPublic?: boolean }) =>
      bookmarksAPI.createCollection(name, isPublic),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['collections'] });
    },
  });
}

// Add place to collection
export function useAddToCollection() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ collectionId, placeId }: { collectionId: string; placeId: string }) =>
      bookmarksAPI.addPlace(collectionId, placeId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['collections'] });
    },
  });
}

// Remove place from collection
export function useRemoveFromCollection() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ collectionId, placeId }: { collectionId: string; placeId: string }) =>
      bookmarksAPI.removePlace(collectionId, placeId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['collections'] });
    },
  });
}

// Delete collection
export function useDeleteCollection() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (collectionId: string) => bookmarksAPI.deleteCollection(collectionId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['collections'] });
    },
  });
}
