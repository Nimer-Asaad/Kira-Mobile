import { useRouter } from "expo-router";
import React from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useAuth } from "../../src/auth/AuthContext";
import { useMode } from "../../src/context/ModeContext";
import {
  COLORS,
  RADIUS,
  SHADOWS,
  SPACING,
  TYPOGRAPHY,
} from "../../src/utils/constants";

interface ModeCardProps {
  mode: "company" | "personal";
  title: string;
  description: string;
  icon: React.ReactNode;
  onSelect: () => void;
}

const ModeCard: React.FC<ModeCardProps> = ({
  title,
  description,
  icon,
  onSelect,
}) => {
  return (
    <TouchableOpacity
      style={styles.modeCard}
      onPress={onSelect}
      activeOpacity={0.8}
    >
      <View style={styles.modeCardContent}>
        <View style={styles.iconContainer}>{icon}</View>
        <View style={styles.textContainer}>
          <Text style={styles.modeTitle}>{title}</Text>
          <Text style={styles.modeDescription}>{description}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

export default function ChooseModeScreen() {
  const router = useRouter();
  const { setMode } = useMode();
  const { isAuthenticated } = useAuth();

  const handleModeSelect = async (selectedMode: "company" | "personal") => {
    try {
      await setMode(selectedMode);

      // If already authenticated, navigate to app tabs
      // Otherwise, navigate to login
      if (isAuthenticated) {
        // Navigate to tasks tab - root layout will handle showing (app) stack
        router.replace("/(app)/(tabs)/tasks" as any);
      } else {
        router.push(`/(auth)/login?mode=${selectedMode}`);
      }
    } catch (error) {
      console.error("Error setting mode:", error);
    }
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
    >
      {/* Header Section */}
      <View style={styles.header}>
        <Text style={styles.title}>Choose your workspace</Text>
        <Text style={styles.subtitle}>
          Kira works for teams and for personal productivity. Select how you
          want to use it.
        </Text>
      </View>

      {/* Mode Selection Cards */}
      <View style={styles.cardsContainer}>
        <ModeCard
          mode="company"
          title="Company"
          description="HR inbox, team task distribution, roles, reports & dashboards."
          icon={
            <View style={styles.iconWrapper}>
              <Text style={styles.iconText}>🏢</Text>
            </View>
          }
          onSelect={() => handleModeSelect("company")}
        />

        <ModeCard
          mode="personal"
          title="Personal"
          description="My tasks, calendar, daily planning, progress charts & weekly report."
          icon={
            <View style={styles.iconWrapper}>
              <Text style={styles.iconText}>👤</Text>
            </View>
          }
          onSelect={() => handleModeSelect("personal")}
        />
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>
          You can change this later in settings
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  contentContainer: {
    flexGrow: 1,
    padding: SPACING.lg,
    paddingTop: SPACING.xxxl + 20,
  },
  header: {
    marginBottom: SPACING.xxxl,
    alignItems: "center",
  },
  title: {
    fontSize: TYPOGRAPHY.fontSize.massive,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.text,
    textAlign: "center",
    marginBottom: SPACING.md,
  },
  subtitle: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    color: COLORS.textSecondary,
    textAlign: "center",
    lineHeight: TYPOGRAPHY.lineHeight.relaxed * TYPOGRAPHY.fontSize.lg,
    paddingHorizontal: SPACING.md,
  },
  cardsContainer: {
    gap: SPACING.lg,
    marginBottom: SPACING.xl,
  },
  modeCard: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.xl,
    borderWidth: 2,
    borderColor: COLORS.border,
    padding: SPACING.lg,
    ...SHADOWS.md,
  },
  modeCardContent: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: SPACING.md,
  },
  iconContainer: {
    flexShrink: 0,
  },
  iconWrapper: {
    width: 48,
    height: 48,
    borderRadius: RADIUS.lg,
    backgroundColor: COLORS.primary,
    justifyContent: "center",
    alignItems: "center",
  },
  iconText: {
    fontSize: 24,
  },
  textContainer: {
    flex: 1,
  },
  modeTitle: {
    fontSize: TYPOGRAPHY.fontSize.xxl,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  modeDescription: {
    fontSize: TYPOGRAPHY.fontSize.base,
    color: COLORS.textSecondary,
    lineHeight: TYPOGRAPHY.lineHeight.relaxed * TYPOGRAPHY.fontSize.base,
  },
  footer: {
    alignItems: "center",
    marginTop: SPACING.xl,
  },
  footerText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textLight,
    textAlign: "center",
  },
});
