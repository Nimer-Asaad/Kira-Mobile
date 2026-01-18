import React, { createContext, useContext, useEffect, useState } from "react";
import { STORAGE_KEYS } from "../utils/constants";
import { storage } from "../utils/storage";

type Theme = "light" | "dark";
type Language = "en" | "ar";
type ColorTheme = "default" | "blue" | "purple" | "green" | "orange";

interface ThemeContextType {
  theme: Theme;
  language: Language;
  colorTheme: ColorTheme;
  isDark: boolean;
  setTheme: (theme: Theme) => Promise<void>;
  toggleTheme: () => Promise<void>;
  setLanguage: (language: Language) => Promise<void>;
  toggleLanguage: () => Promise<void>;
  setColorTheme: (colorTheme: ColorTheme) => Promise<void>;
  isLoading: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [theme, setThemeState] = useState<Theme>("light");
  const [language, setLanguageState] = useState<Language>("en");
  const [colorTheme, setColorThemeState] = useState<ColorTheme>("default");
  const [isLoading, setIsLoading] = useState(true);

  // Load theme settings from storage on mount
  useEffect(() => {
    const loadTheme = async () => {
      try {
        const savedTheme = (await storage.getItem(
          STORAGE_KEYS.THEME
        )) as Theme | null;
        const savedLanguage = (await storage.getItem(
          STORAGE_KEYS.LANGUAGE
        )) as Language | null;
        const savedColorTheme = (await storage.getItem(
          STORAGE_KEYS.COLOR_THEME
        )) as ColorTheme | null;

        if (savedTheme === "light" || savedTheme === "dark") {
          setThemeState(savedTheme);
        }
        if (savedLanguage === "en" || savedLanguage === "ar") {
          setLanguageState(savedLanguage);
        }
        if (
          savedColorTheme === "default" ||
          savedColorTheme === "blue" ||
          savedColorTheme === "purple" ||
          savedColorTheme === "green" ||
          savedColorTheme === "orange"
        ) {
          setColorThemeState(savedColorTheme);
        }
      } catch (error) {
        console.error("Error loading theme settings:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadTheme();
  }, []);

  const setTheme = async (newTheme: Theme) => {
    try {
      await storage.setItem(STORAGE_KEYS.THEME, newTheme);
      setThemeState(newTheme);
    } catch (error) {
      console.error("Error saving theme:", error);
      throw error;
    }
  };

  const toggleTheme = async () => {
    const newTheme = theme === "light" ? "dark" : "light";
    await setTheme(newTheme);
  };

  const setLanguage = async (newLanguage: Language) => {
    try {
      await storage.setItem(STORAGE_KEYS.LANGUAGE, newLanguage);
      setLanguageState(newLanguage);
    } catch (error) {
      console.error("Error saving language:", error);
      throw error;
    }
  };

  const toggleLanguage = async () => {
    const newLanguage = language === "en" ? "ar" : "en";
    await setLanguage(newLanguage);
  };

  const setColorTheme = async (newColorTheme: ColorTheme) => {
    try {
      await storage.setItem(STORAGE_KEYS.COLOR_THEME, newColorTheme);
      setColorThemeState(newColorTheme);
    } catch (error) {
      console.error("Error saving color theme:", error);
      throw error;
    }
  };

  const value: ThemeContextType = {
    theme,
    language,
    colorTheme,
    isDark: theme === "dark",
    setTheme,
    toggleTheme,
    setLanguage,
    toggleLanguage,
    setColorTheme,
    isLoading,
  };

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within ThemeProvider");
  }
  return context;
};
