/**
 * Theme configuration for Kira Mobile
 * Centralized colors, spacing, typography
 */

import { Platform } from 'react-native';

// Brand Colors
export const COLORS = {
  // Primary brand colors
  primary: '#6366f1', // Indigo
  primaryDark: '#4f46e5',
  primaryLight: '#818cf8',
  
  secondary: '#8b5cf6', // Purple
  secondaryDark: '#7c3aed',
  secondaryLight: '#a78bfa',
  
  // Status colors
  success: '#10b981',
  successLight: '#34d399',
  warning: '#f59e0b',
  warningLight: '#fbbf24',
  error: '#ef4444',
  errorLight: '#f87171',
  info: '#3b82f6',
  
  // Neutral colors
  background: '#ffffff',
  backgroundDark: '#f9fafb',
  backgroundGray: '#f3f4f6',
  
  text: '#111827',
  textSecondary: '#6b7280',
  textLight: '#9ca3af',
  textDisabled: '#d1d5db',
  
  border: '#e5e7eb',
  borderLight: '#f3f4f6',
  borderDark: '#d1d5db',
  
  // Surface colors
  surface: '#ffffff',
  surfaceHover: '#f9fafb',
  overlay: 'rgba(0, 0, 0, 0.5)',
  
  // Task status colors
  pending: '#6b7280',
  inProgress: '#f59e0b',
  completed: '#10b981',
};

// Spacing system (8pt grid)
export const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 40,
  xxxl: 48,
};

// Typography
export const TYPOGRAPHY = {
  fontFamily: {
    regular: Platform.select({
      ios: 'System',
      android: 'Roboto',
      default: 'system-ui',
    }),
    medium: Platform.select({
      ios: 'System',
      android: 'Roboto-Medium',
      default: 'system-ui',
    }),
    bold: Platform.select({
      ios: 'System',
      android: 'Roboto-Bold',
      default: 'system-ui',
    }),
  },
  
  fontSize: {
    xs: 11,
    sm: 12,
    base: 14,
    md: 15,
    lg: 16,
    xl: 18,
    xxl: 20,
    xxxl: 24,
    huge: 28,
    massive: 32,
  },
  
  fontWeight: {
    regular: '400' as const,
    medium: '500' as const,
    semibold: '600' as const,
    bold: '700' as const,
  },
  
  lineHeight: {
    tight: 1.2,
    normal: 1.5,
    relaxed: 1.75,
  },
};

// Border radius
export const RADIUS = {
  xs: 4,
  sm: 6,
  md: 8,
  lg: 12,
  xl: 16,
  xxl: 20,
  round: 9999,
};

// Shadows
export const SHADOWS = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
};

// Original theme colors (for compatibility with existing components)
const tintColorLight = '#0a7ea4';
const tintColorDark = '#fff';

export const Colors = {
  light: {
    text: '#11181C',
    background: '#fff',
    tint: tintColorLight,
    icon: '#687076',
    tabIconDefault: '#687076',
    tabIconSelected: tintColorLight,
  },
  dark: {
    text: '#ECEDEE',
    background: '#151718',
    tint: tintColorDark,
    icon: '#9BA1A6',
    tabIconDefault: '#9BA1A6',
    tabIconSelected: tintColorDark,
  },
};

export const Fonts = Platform.select({
  ios: {
    sans: 'system-ui',
    serif: 'ui-serif',
    rounded: 'ui-rounded',
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded: "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "'Menlo', 'Monaco', 'Courier New', monospace",
  },
});

// Export default theme
export const theme = {
  colors: COLORS,
  spacing: SPACING,
  typography: TYPOGRAPHY,
  radius: RADIUS,
  shadows: SHADOWS,
};

export default theme;
