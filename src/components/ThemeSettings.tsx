import { ColorTheme } from "@/constants/theme";
import { useTheme } from "@/src/context/ThemeContext";
import { useThemedColors } from "@/src/hooks/use-themed-colors";
import React from "react";
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const THEME_OPTIONS = ["light", "dark"] as const;
const LANGUAGE_OPTIONS = [
  { label: "English", value: "en" },
  { label: "العربية", value: "ar" },
] as const;
const COLOR_THEME_OPTIONS: { label: string; value: ColorTheme }[] = [
  { label: "Default", value: "default" },
  { label: "Blue", value: "blue" },
  { label: "Purple", value: "purple" },
  { label: "Green", value: "green" },
  { label: "Orange", value: "orange" },
];

interface ThemeSettingsSectionProps {
  title: string;
  description: string;
  children: React.ReactNode;
}

const ThemeSettingsSection: React.FC<ThemeSettingsSectionProps> = ({
  title,
  description,
  children,
}) => {
  const colors = useThemedColors();
  return (
    <View style={[styles.section, { backgroundColor: colors.background }]}>
      <Text style={[styles.sectionTitle, { color: colors.text }]}>{title}</Text>
      <Text style={[styles.sectionDescription, { color: colors.icon }]}>
        {description}
      </Text>
      {children}
    </View>
  );
};

interface OptionButtonProps {
  label: string;
  isSelected: boolean;
  onPress: () => void;
  color?: string;
}

const OptionButton: React.FC<OptionButtonProps> = ({
  label,
  isSelected,
  onPress,
  color,
}) => {
  const colors = useThemedColors();
  return (
    <TouchableOpacity
      style={[
        styles.optionButton,
        {
          backgroundColor: isSelected ? colors.tint : colors.icon + "20",
          borderColor: colors.tint,
          borderWidth: isSelected ? 2 : 1,
        },
      ]}
      onPress={onPress}
    >
      {color && (
        <View
          style={[
            styles.colorPreview,
            { backgroundColor: color },
            { borderColor: colors.text },
          ]}
        />
      )}
      <Text
        style={[
          styles.optionButtonText,
          {
            color: isSelected ? "#fff" : colors.text,
            fontWeight: isSelected ? "600" : "500",
          },
        ]}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );
};

export const ThemeSettings: React.FC = () => {
  const {
    theme,
    language,
    colorTheme,
    toggleTheme,
    setLanguage,
    setColorTheme,
  } = useTheme();
  const colors = useThemedColors();

  const handleLanguageChange = async (newLanguage: "en" | "ar") => {
    if (newLanguage !== language) {
      try {
        await setLanguage(newLanguage);
      } catch (error) {
        Alert.alert("Error", "Failed to change language");
      }
    }
  };

  const handleColorThemeChange = async (newColorTheme: ColorTheme) => {
    if (newColorTheme !== colorTheme) {
      try {
        await setColorTheme(newColorTheme);
      } catch (error) {
        Alert.alert("Error", "Failed to change color theme");
      }
    }
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.contentContainer}
    >
      {/* Theme Mode Section */}
      <ThemeSettingsSection
        title="Theme Mode"
        description="Choose between light and dark mode"
      >
        <View style={styles.buttonGroup}>
          <OptionButton
            label="Light"
            isSelected={theme === "light"}
            onPress={toggleTheme}
          />
          <OptionButton
            label="Dark"
            isSelected={theme === "dark"}
            onPress={toggleTheme}
          />
        </View>
      </ThemeSettingsSection>

      {/* Language Section */}
      <ThemeSettingsSection
        title="Language"
        description="Select your preferred language"
      >
        <View style={styles.buttonGroup}>
          {LANGUAGE_OPTIONS.map((option) => (
            <OptionButton
              key={option.value}
              label={option.label}
              isSelected={language === option.value}
              onPress={() => handleLanguageChange(option.value)}
            />
          ))}
        </View>
      </ThemeSettingsSection>

      {/* Color Theme Section */}
      <ThemeSettingsSection
        title="Color Theme"
        description="Choose your preferred accent color"
      >
        <View style={styles.colorGrid}>
          {COLOR_THEME_OPTIONS.map((option) => (
            <View key={option.value} style={styles.colorThemeItem}>
              <OptionButton
                label={option.label}
                isSelected={colorTheme === option.value}
                onPress={() => handleColorThemeChange(option.value)}
              />
            </View>
          ))}
        </View>
      </ThemeSettingsSection>

      {/* Theme Preview Section */}
      <ThemeSettingsSection
        title="Theme Preview"
        description="See how your theme looks"
      >
        <View
          style={[
            styles.previewContainer,
            {
              backgroundColor:
                theme === "dark"
                  ? colors.background + "EE"
                  : colors.icon + "10",
              borderColor: colors.tint,
            },
          ]}
        >
          <View style={styles.previewRow}>
            <View
              style={[
                styles.previewBox,
                {
                  backgroundColor: colors.tint,
                  borderColor: colors.tint,
                },
              ]}
            >
              <Text
                style={[
                  styles.previewBoxText,
                  { color: theme === "dark" ? "#000" : "#fff" },
                ]}
              >
                Primary
              </Text>
            </View>
            <View
              style={[
                styles.previewBox,
                {
                  backgroundColor: colors.background,
                  borderColor: colors.icon,
                  borderWidth: 1,
                },
              ]}
            >
              <Text style={[styles.previewBoxText, { color: colors.text }]}>
                Card
              </Text>
            </View>
          </View>
          <Text
            style={[styles.previewLabel, { color: colors.text, marginTop: 12 }]}
          >
            Current: {colorTheme.charAt(0).toUpperCase() + colorTheme.slice(1)}{" "}
            ({theme})
          </Text>
        </View>
      </ThemeSettingsSection>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 32,
  },
  section: {
    marginBottom: 24,
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderRadius: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 8,
  },
  sectionDescription: {
    fontSize: 14,
    marginBottom: 12,
    lineHeight: 20,
  },
  buttonGroup: {
    flexDirection: "row",
    gap: 8,
    flexWrap: "wrap",
  },
  optionButton: {
    flex: 1,
    minWidth: 100,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  optionButtonText: {
    fontSize: 14,
    textAlign: "center",
  },
  colorPreview: {
    width: 16,
    height: 16,
    borderRadius: 4,
    borderWidth: 2,
  },
  colorGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  colorThemeItem: {
    width: "48%",
  },
  previewContainer: {
    marginTop: 12,
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
  },
  previewRow: {
    flexDirection: "row",
    gap: 8,
    justifyContent: "space-between",
  },
  previewBox: {
    flex: 1,
    height: 60,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  previewBoxText: {
    fontSize: 12,
    fontWeight: "600",
  },
  previewLabel: {
    fontSize: 12,
    fontWeight: "500",
    textAlign: "center",
  },
});
