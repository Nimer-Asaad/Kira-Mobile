import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useMemo, useState } from "react";
import { ActivityIndicator, Platform, Text, View } from "react-native";
import { WebView } from "react-native-webview";
import "react-native-reanimated";

import { AuthProvider, useAuth } from "@/src/auth/AuthContext";
import { ModeProvider, useMode } from "@/src/context/ModeContext";
import {
  ThemeProvider as AppThemeProvider,
  useTheme,
} from "@/src/context/ThemeContext";
import { useColorScheme } from "@/src/hooks";
import { COLORS } from "@/src/theme";

export const unstable_settings = {
  anchor: "(app)",
};

function RootLayoutNav() {
  const colorScheme = useColorScheme();
  const { isLoading } = useAuth();
  const { isLoading: modeLoading } = useMode();
  const { isLoading: themeLoading } = useTheme();
  const [webError, setWebError] = useState<{
    url: string;
    code?: number;
    description?: string;
  } | null>(null);

  // Show loading spinner while bootstrapping
  if (isLoading || modeLoading || themeLoading) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: COLORS.background,
        }}
      >
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  // Always render web app inside a WebView shell
  // By default this points at the local web dev server; you can override
  // it at build time with EXPO_PUBLIC_WEB_APP_URL.
  const webAppUrl = useMemo(() => {
    const envUrl = process.env.EXPO_PUBLIC_WEB_APP_URL;
    if (envUrl) return envUrl;

    // Dev default:
    // - Android emulator: host machine is reachable via 10.0.2.2
    // - iOS simulator: localhost works
    // - Physical device: you must use your LAN IP (set EXPO_PUBLIC_WEB_APP_URL)
    const host =
      Platform.OS === "android" ? "http://10.0.2.2:5173" : "http://localhost:5173";
    return host;
  }, []);

  return (
    <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
      <View style={{ flex: 1, backgroundColor: COLORS.background }}>
        {webError ? (
          <View
            style={{
              flex: 1,
              padding: 16,
              justifyContent: "center",
              gap: 10,
            }}
          >
            <Text style={{ color: COLORS.text, fontSize: 18, fontWeight: "700" }}>
              Error loading page
            </Text>
            <Text style={{ color: COLORS.textSecondary }}>
              URL: {webError.url}
            </Text>
            <Text style={{ color: COLORS.textSecondary }}>
              Code: {String(webError.code ?? "unknown")}
            </Text>
            <Text style={{ color: COLORS.textSecondary }}>
              Description: {String(webError.description ?? "unknown")}
            </Text>
            <Text style={{ color: COLORS.textSecondary, marginTop: 8 }}>
              Tip: Start the web app and make sure this URL is reachable from your
              emulator/device. For Android emulator, use 10.0.2.2 instead of
              localhost.
            </Text>
          </View>
        ) : (
          <WebView
            source={{ uri: webAppUrl }}
            style={{ flex: 1 }}
            startInLoadingState
            onError={(e) => {
              setWebError({
                url: webAppUrl,
                code: e.nativeEvent?.code,
                description: e.nativeEvent?.description,
              });
            }}
          />
        )}
      </View>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <ModeProvider>
        <AppThemeProvider>
          <RootLayoutNav />
        </AppThemeProvider>
      </ModeProvider>
    </AuthProvider>
  );
}
