import { getColorTheme } from "@/constants/theme";
import { useTheme } from "@/src/context/ThemeContext";
import { useColorScheme } from "./use-color-scheme";

export function useThemedColors() {
  const systemTheme = useColorScheme() ?? "light";
  const { theme, colorTheme } = useTheme();

  // Use context theme if explicitly set, otherwise fall back to system theme
  const effectiveTheme =
    theme === "light" || theme === "dark" ? theme : systemTheme;

  return getColorTheme(effectiveTheme, colorTheme);
}
