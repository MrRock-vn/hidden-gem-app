import { Alert } from 'react-native';

export function showToast(message: string, type: 'success' | 'error' | 'info' = 'info') {
  // For now, use Alert. In production, use a toast library like react-native-toast-message
  Alert.alert(
    type === 'success' ? '✅ Thành công' : type === 'error' ? '❌ Lỗi' : 'ℹ️ Thông báo',
    message,
    [{ text: 'OK' }],
    { cancelable: true }
  );
}
