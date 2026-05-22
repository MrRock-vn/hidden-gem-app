// ─── Shared brand colors (không đổi theo theme) ───────────────────────────
const brand = {
  primary: '#6C63FF',
  primaryLight: '#8B85FF',
  primaryDark: '#4A42DB',
  accent: '#FF6584',
  accentLight: '#FF8FA3',
  accentDark: '#E04D6B',
  success: '#4ADE80',
  warning: '#FBBF24',
  error: '#EF4444',
  info: '#60A5FA',
  gradientStart: '#6C63FF',
  gradientEnd: '#FF6584',
  mapMarker: '#6C63FF',
  mapCluster: '#FF6584',
  like: '#EF4444',
  bookmark: '#FBBF24',
  comment: '#60A5FA',
  white: '#FFFFFF',
  black: '#000000',
  transparent: 'transparent' as const,
  overlay: 'rgba(0, 0, 0, 0.5)',
};

// ─── Light palette ─────────────────────────────────────────────────────────
export const LightColors = {
  ...brand,
  background: '#FBFCFF',
  backgroundLight: '#FFFFFF',
  backgroundCard: '#FFFFFF',
  backgroundElevated: '#F5F7FC',
  surface: '#FFFFFF',
  surfaceLight: '#F7F9FE',
  surfaceBorder: '#E5EAF3',
  textPrimary: '#151827',
  textSecondary: '#566176',
  textMuted: '#8B94A7',
  textInverse: '#FFFFFF',
  shimmer: '#F0F3FA',
  border: '#E5EAF3',
  card: '#FFFFFF',
  text: '#151827',
};

// ─── Dark palette ──────────────────────────────────────────────────────────
export const DarkColors = {
  ...brand,
  background: '#0F0F1A',
  backgroundLight: '#1A1A2E',
  backgroundCard: '#1E1E30',
  backgroundElevated: '#252538',
  surface: '#1E1E30',
  surfaceLight: '#252538',
  surfaceBorder: '#2E2E48',
  textPrimary: '#F0F0FF',
  textSecondary: '#A0A8C0',
  textMuted: '#6B7494',
  textInverse: '#151827',
  shimmer: '#252538',
  border: '#2E2E48',
  card: '#1E1E30',
  text: '#F0F0FF',
};

export type ThemeColors = typeof LightColors;

/** Trả về bộ màu phù hợp với trạng thái dark mode */
export const getColors = (isDark: boolean): ThemeColors =>
  isDark ? DarkColors : LightColors;

// --- Dynamic Colors Getters & StyleSheet.create Monkeypatch for Automatic Dark Mode ---
import { StyleSheet } from 'react-native';

const lightToDarkMap: Record<string, string> = {
  '#FBFCFF': '#0F0F1A',
  '#FFFFFF': '#1E1E30',
  '#F5F7FC': '#252538',
  '#F7F9FE': '#252538',
  '#E5EAF3': '#2E2E48',
  '#151827': '#F0F0FF',
  '#566176': '#A0A8C0',
  '#8B94A7': '#6B7494',
  '#F0F3FA': '#252538',
  '#fbfcff': '#0F0F1A',
  '#ffffff': '#1E1E30',
  '#f5f7fc': '#252538',
  '#f7f9fe': '#252538',
  '#e5eaf3': '#2E2E48',
  '#8b94a7': '#6B7494',
  '#f0f3fa': '#252538',
};

const darkToLightMap: Record<string, string> = {
  '#0F0F1A': '#FBFCFF',
  '#1A1A2E': '#FFFFFF',
  '#1E1E30': '#FFFFFF',
  '#252538': '#F7F9FE',
  '#2E2E48': '#E5EAF3',
  '#F0F0FF': '#151827',
  '#A0A8C0': '#566176',
  '#6B7494': '#8B94A7',
  '#0f0f1a': '#FBFCFF',
  '#1a1a2e': '#FFFFFF',
  '#1e1e30': '#FFFFFF',
  '#2e2e48': '#E5EAF3',
  '#f0f0ff': '#151827',
  '#a0a8c0': '#566176',
  '#6b7494': '#8B94A7',
};

function translateStyleValue(val: any, isDark: boolean) {
  if (typeof val === 'string') {
    if (isDark) {
      return lightToDarkMap[val] || val;
    } else {
      return darkToLightMap[val] || val;
    }
  }
  return val;
}

const originalStyleSheetCreate = StyleSheet.create;

StyleSheet.create = function (styles: any) {
  const createdStyles = originalStyleSheetCreate(styles);
  const result = {} as any;

  for (const key in createdStyles) {
    Object.defineProperty(result, key, {
      get() {
        const isDark = (global as any).isDarkMode || false;
        const originalStyle = createdStyles[key];
        const dynamicStyle = {} as any;
        for (const prop in originalStyle) {
          dynamicStyle[prop] = translateStyleValue(originalStyle[prop], isDark);
        }
        return dynamicStyle;
      },
      enumerable: true,
      configurable: true,
    });
  }

  return result;
} as any;

export const Colors = {
  get primary() { return ((global as any).isDarkMode ? DarkColors : LightColors).primary; },
  get primaryLight() { return ((global as any).isDarkMode ? DarkColors : LightColors).primaryLight; },
  get primaryDark() { return ((global as any).isDarkMode ? DarkColors : LightColors).primaryDark; },
  get accent() { return ((global as any).isDarkMode ? DarkColors : LightColors).accent; },
  get accentLight() { return ((global as any).isDarkMode ? DarkColors : LightColors).accentLight; },
  get accentDark() { return ((global as any).isDarkMode ? DarkColors : LightColors).accentDark; },
  get success() { return ((global as any).isDarkMode ? DarkColors : LightColors).success; },
  get warning() { return ((global as any).isDarkMode ? DarkColors : LightColors).warning; },
  get error() { return ((global as any).isDarkMode ? DarkColors : LightColors).error; },
  get info() { return ((global as any).isDarkMode ? DarkColors : LightColors).info; },
  get background() { return ((global as any).isDarkMode ? DarkColors : LightColors).background; },
  get backgroundLight() { return ((global as any).isDarkMode ? DarkColors : LightColors).backgroundLight; },
  get backgroundCard() { return ((global as any).isDarkMode ? DarkColors : LightColors).backgroundCard; },
  get backgroundElevated() { return ((global as any).isDarkMode ? DarkColors : LightColors).backgroundElevated; },
  get surface() { return ((global as any).isDarkMode ? DarkColors : LightColors).surface; },
  get surfaceLight() { return ((global as any).isDarkMode ? DarkColors : LightColors).surfaceLight; },
  get surfaceBorder() { return ((global as any).isDarkMode ? DarkColors : LightColors).surfaceBorder; },
  get textPrimary() { return ((global as any).isDarkMode ? DarkColors : LightColors).textPrimary; },
  get textSecondary() { return ((global as any).isDarkMode ? DarkColors : LightColors).textSecondary; },
  get textMuted() { return ((global as any).isDarkMode ? DarkColors : LightColors).textMuted; },
  get textInverse() { return ((global as any).isDarkMode ? DarkColors : LightColors).textInverse; },
  get shimmer() { return ((global as any).isDarkMode ? DarkColors : LightColors).shimmer; },
  get border() { return ((global as any).isDarkMode ? DarkColors : LightColors).border; },
  get card() { return ((global as any).isDarkMode ? DarkColors : LightColors).card; },
  get text() { return ((global as any).isDarkMode ? DarkColors : LightColors).text; },
  get white() { return ((global as any).isDarkMode ? DarkColors : LightColors).white; },
  get black() { return ((global as any).isDarkMode ? DarkColors : LightColors).black; },
  get transparent() { return ((global as any).isDarkMode ? DarkColors : LightColors).transparent; },
  get overlay() { return ((global as any).isDarkMode ? DarkColors : LightColors).overlay; },
  get mapMarker() { return ((global as any).isDarkMode ? DarkColors : LightColors).mapMarker; },
  get mapCluster() { return ((global as any).isDarkMode ? DarkColors : LightColors).mapCluster; },
  get like() { return ((global as any).isDarkMode ? DarkColors : LightColors).like; },
  get bookmark() { return ((global as any).isDarkMode ? DarkColors : LightColors).bookmark; },
  get comment() { return ((global as any).isDarkMode ? DarkColors : LightColors).comment; },
};

export const Fonts = {
  regular: 'System',
  medium: 'System',
  bold: 'System',
  sizes: {
    xs: 10,
    sm: 12,
    md: 14,
    base: 16,
    lg: 18,
    xl: 20,
    '2xl': 24,
    '3xl': 30,
    '4xl': 36,
  },
};

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  base: 16,
  lg: 20,
  xl: 24,
  '2xl': 32,
  '3xl': 40,
  '4xl': 48,
};

export const BorderRadius = {
  sm: 6,
  md: 10,
  lg: 16,
  xl: 20,
  full: 9999,
};

export const Categories = [
  { id: 'cafe', label: 'Quán cà phê', icon: '☕' },
  { id: 'food', label: 'Ẩm thực', icon: '🍜' },
  { id: 'photo', label: 'Góc chụp ảnh', icon: '📸' },
  { id: 'nature', label: 'Thiên nhiên', icon: '🌿' },
  { id: 'art', label: 'Nghệ thuật', icon: '🎨' },
  { id: 'nightlife', label: 'Về đêm', icon: '🌙' },
  { id: 'shopping', label: 'Mua sắm', icon: '🛍️' },
  { id: 'historic', label: 'Lịch sử', icon: '🏛️' },
  { id: 'beach', label: 'Biển', icon: '🏖️' },
  { id: 'other', label: 'Khác', icon: '📍' },
];

export const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000/api';
