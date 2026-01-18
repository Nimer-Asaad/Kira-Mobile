import { Redirect, Tabs } from "expo-router";
import React from "react";
import { StyleSheet, Text, View } from "react-native";

import { HapticTab } from "@/components/haptic-tab";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { useAuth } from "../../src/auth/AuthContext";
import { useUnreadCount } from "../../src/hooks/useUnreadCount";
import { COLORS } from "../../src/utils/constants";

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const { isAuthenticated, user } = useAuth();
  const { unreadCount } = useUnreadCount(true);

  // If not authenticated, redirect to login
  if (!isAuthenticated) {
    return <Redirect href="/(auth)/login" />;
  }

  // Detect personal workspace (backend may supply workspaceMode or role 'personal')
  const isPersonal = Boolean(
    (user as any)?.workspaceMode === "personal" ||
      (user as any)?.mode === "personal" ||
      (user as any)?.role === "personal"
  );

  // Check if user has access to team/inbox features (only admin/hr should)
  const hasTeamAccess = user?.role === "admin" || user?.role === "hr";
  const showCompanyTasks = !isPersonal;

  // Personal tab is ONLY visible for users with personal role - strict check
  const isPersonalRole = user && user.role === "personal";

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? "light"].tint,
        headerShown: false,
        tabBarButton: HapticTab,
      }}
    >
      {/* Dev-only user info overlay to help debug role/workspace mismatches */}
      {__DEV__ && (
        <View style={devStyles.overlay} pointerEvents="none">
          <Text style={devStyles.overlayText}>
            role: {String((user as any)?.role)}
          </Text>
          <Text style={devStyles.overlayText}>
            workspaceMode: {String((user as any)?.workspaceMode)}
          </Text>
          <Text style={devStyles.overlayText}>
            mode: {String((user as any)?.mode)}
          </Text>
        </View>
      )}
      <Tabs.Screen
        name="index"
        options={{
          title: "Tasks",
          tabBarIcon: ({ color }) => (
            <IconSymbol size={28} name="checklist" color={color} />
          ),
        }}
      />
      {isPersonalRole && (
        <Tabs.Screen
          name="personal"
          options={{
            title: "Personal",
            tabBarIcon: ({ color }) => (
              <IconSymbol size={28} name="person.fill" color={color} />
            ),
          }}
        />
      )}
      {hasTeamAccess && (
        <Tabs.Screen
          name="chat"
          options={{
            title: "Chat",
            tabBarIcon: ({ color }) => (
              <View>
                <IconSymbol size={28} name="message.fill" color={color} />
                {unreadCount > 0 && (
                  <View style={styles.badge}>
                    <Text style={styles.badgeText}>
                      {unreadCount > 99 ? "99+" : unreadCount}
                    </Text>
                  </View>
                )}
              </View>
            ),
          }}
        />
      )}
      {hasTeamAccess && (
        <Tabs.Screen
          name="explore"
          options={{
            title: "Team",
            tabBarIcon: ({ color }) => (
              <IconSymbol size={28} name="square.grid.2x2" color={color} />
            ),
          }}
        />
      )}
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ color }) => (
            <IconSymbol size={28} name="person.circle.fill" color={color} />
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  badge: {
    position: "absolute",
    top: -8,
    right: -8,
    backgroundColor: COLORS.primary,
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  badgeText: {
    color: "#fff",
    fontSize: 10,
    fontWeight: "bold",
  },
});

const devStyles = StyleSheet.create({
  overlay: {
    position: "absolute",
    top: 40,
    right: 8,
    backgroundColor: "rgba(0,0,0,0.6)",
    padding: 6,
    borderRadius: 6,
    zIndex: 9999,
  },
  overlayText: {
    color: "#fff",
    fontSize: 11,
  },
});
