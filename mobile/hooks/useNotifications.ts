import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { notificationsAPI } from '../services/api';

// ===== MOCK DATA =====
const MOCK_NOTIFICATIONS = [
  {
    id: '1',
    type: 'like',
    is_read: false,
    created_at: new Date(Date.now() - 1000 * 60 * 30).toISOString(), // 30 min ago
    actor: { id: 'u1', username: 'coffeeaddict', avatar_url: null },
    place: { id: 'p1', title: 'Quán Cà Phê Hideout' },
  },
  {
    id: '2',
    type: 'comment',
    is_read: false,
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), // 2h ago
    actor: { id: 'u2', username: 'photohunter', avatar_url: null },
    place: { id: 'p2', title: 'Góc Chụp Ảnh Sunset Hill' },
  },
  {
    id: '3',
    type: 'follow',
    is_read: true,
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), // 1d ago
    actor: { id: 'u3', username: 'foodielover', avatar_url: null },
    place: null,
  },
  {
    id: '4',
    type: 'like',
    is_read: true,
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 36).toISOString(), // 1.5d ago
    actor: { id: 'u4', username: 'naturelover', avatar_url: null },
    place: { id: 'p4', title: 'Vườn Bí Mật Garden' },
  },
  {
    id: '5',
    type: 'reply',
    is_read: true,
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 72).toISOString(), // 3d ago
    actor: { id: 'u5', username: 'explorer_vn', avatar_url: null },
    place: { id: 'p1', title: 'Quán Cà Phê Hideout' },
  },
];

export type Notification = typeof MOCK_NOTIFICATIONS[0];

// Fetch notifications
export function useNotifications(unreadOnly?: boolean) {
  return useQuery({
    queryKey: ['notifications', unreadOnly],
    queryFn: async () => {
      try {
        const response = await notificationsAPI.getAll(1, unreadOnly);
        const responseData = response.data;
        return (responseData?.data || responseData) as Notification[];
      } catch (error) {
        if (!__DEV__) throw error;
        let result = [...MOCK_NOTIFICATIONS];
        if (unreadOnly) {
          result = result.filter((n) => !n.is_read);
        }
        return result;
      }
    },
    refetchInterval: 30000, // Refetch every 30 seconds
  });
}

// Get unread count
export function useUnreadCount() {
  return useQuery({
    queryKey: ['notifications', 'unread-count'],
    queryFn: async () => {
      try {
        const response = await notificationsAPI.getAll(1, true);
        const responseData = response.data;
        // Backend returns { data: [...], meta: { unread_count } }
        if (responseData?.meta?.unread_count !== undefined) {
          return responseData.meta.unread_count;
        }
        const items = responseData?.data || responseData;
        return Array.isArray(items) ? items.length : 0;
      } catch (error) {
        if (!__DEV__) throw error;
        return MOCK_NOTIFICATIONS.filter((n) => !n.is_read).length;
      }
    },
    refetchInterval: 30000,
  });
}

// Mark as read
export function useMarkAsRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (ids?: string[]) => notificationsAPI.markAsRead(ids),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });
}

// Delete notification
export function useDeleteNotification() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => notificationsAPI.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });
}
