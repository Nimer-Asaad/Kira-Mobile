/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * Multiple color themes are available: default, blue, purple, green, and orange.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

import { Platform } from "react-native";

// Color theme definitions
export type ColorTheme = "default" | "blue" | "purple" | "green" | "orange";

const tintColorLight = "#0a7ea4";
const tintColorDark = "#fff";

// Base colors for light and dark modes
const baseLight = {
  text: "#11181C",
  background: "#fff",
  icon: "#687076",
  tabIconDefault: "#687076",
};

const baseDark = {
  text: "#ECEDEE",
  background: "#151718",
  icon: "#9BA1A6",
  tabIconDefault: "#9BA1A6",
};

// Color themes
export const ColorThemes = {
  default: {
    light: { ...baseLight, tint: "#0a7ea4", tabIconSelected: "#0a7ea4" },
    dark: { ...baseDark, tint: "#fff", tabIconSelected: "#fff" },
  },
  blue: {
    light: { ...baseLight, tint: "#0066cc", tabIconSelected: "#0066cc" },
    dark: { ...baseDark, tint: "#6ba3ff", tabIconSelected: "#6ba3ff" },
  },
  purple: {
    light: { ...baseLight, tint: "#7c3aed", tabIconSelected: "#7c3aed" },
    dark: { ...baseDark, tint: "#c084fc", tabIconSelected: "#c084fc" },
  },
  green: {
    light: { ...baseLight, tint: "#059669", tabIconSelected: "#059669" },
    dark: { ...baseDark, tint: "#6ee7b7", tabIconSelected: "#6ee7b7" },
  },
  orange: {
    light: { ...baseLight, tint: "#ea580c", tabIconSelected: "#ea580c" },
    dark: { ...baseDark, tint: "#fed7aa", tabIconSelected: "#fed7aa" },
  },
};

export const Colors = {
  light: {
    text: "#11181C",
    background: "#fff",
    tint: tintColorLight,
    icon: "#687076",
    tabIconDefault: "#687076",
    tabIconSelected: tintColorLight,
  },
  dark: {
    text: "#ECEDEE",
    background: "#151718",
    tint: tintColorDark,
    icon: "#9BA1A6",
    tabIconDefault: "#9BA1A6",
    tabIconSelected: tintColorDark,
  },
};

export const getColorTheme = (
  theme: "light" | "dark",
  colorTheme: ColorTheme = "default"
) => {
  return ColorThemes[colorTheme]?.[theme] || Colors[theme];
};

export const Fonts = Platform.select({
  ios: {
    /** iOS `UIFontDescriptorSystemDesignDefault` */
    sans: "system-ui",
    /** iOS `UIFontDescriptorSystemDesignSerif` */
    serif: "ui-serif",
    /** iOS `UIFontDescriptorSystemDesignRounded` */
    rounded: "ui-rounded",
    /** iOS `UIFontDescriptorSystemDesignMonospaced` */
    mono: "ui-monospace",
  },
  default: {
    sans: "normal",
    serif: "serif",
    rounded: "normal",
    mono: "monospace",
  },
  web: {
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded:
      "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});
