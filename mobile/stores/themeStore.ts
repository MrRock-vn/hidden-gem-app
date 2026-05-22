import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getColors, ThemeColors } from '../constants/theme';

const DARK_MODE_KEY = 'darkMode';

interface ThemeState {
  isDark: boolean;
  colors: ThemeColors;

  /** Gọi 1 lần khi app khởi động để load setting đã lưu */
  loadTheme: () => Promise<void>;

  /** Bật/tắt dark mode, lưu xuống storage ngay lập tức */
  toggleDarkMode: (value: boolean) => Promise<void>;
}

export const useThemeStore = create<ThemeState>((set) => ({
  isDark: false,
  colors: getColors(false),

  loadTheme: async () => {
    try {
      const stored = await AsyncStorage.getItem(DARK_MODE_KEY);
      const isDark = stored === 'true';
      (global as any).isDarkMode = isDark;
      set({ isDark, colors: getColors(isDark) });
    } catch {
      // Nếu lỗi storage thì giữ light mode
    }
  },

  toggleDarkMode: async (value: boolean) => {
    try {
      await AsyncStorage.setItem(DARK_MODE_KEY, String(value));
    } catch {
      // Vẫn cập nhật UI dù lưu storage thất bại
    }
    (global as any).isDarkMode = value;
    set({ isDark: value, colors: getColors(value) });
  },
}));

/** Shorthand hook — trả về bộ màu + isDark + hàm toggle */
export const useTheme = () => {
  const { isDark, colors, toggleDarkMode } = useThemeStore();
  return { isDark, colors, toggleDarkMode };
};
