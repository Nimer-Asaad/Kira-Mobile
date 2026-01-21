
import { StatusBar } from "expo-status-bar";
import { Platform, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { WebView } from "react-native-webview";

// NOTE: Replace this IP with your computer's local network IP
// Ensure your backend allows this origin in CORS settings
const FRONTEND_URL = "http://192.168.1.121:5173";

export default function HomeScreen() {
  const insets = useSafeAreaInsets();

  if (Platform.OS === "web") {
    return (
      <View style={{ flex: 1, backgroundColor: "#000" }}>
        <iframe
          src={FRONTEND_URL}
          style={{ width: "100%", height: "100%", border: "none" }}
          title="Kira Frontend"
        />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar style="light" translucent />

      <View style={[styles.webViewContainer, { paddingTop: insets.top }]}>
        <WebView
          style={styles.webView}
          source={{ uri: FRONTEND_URL }}
          javaScriptEnabled
          domStorageEnabled
          allowsFullscreenVideo
          sharedCookiesEnabled
          thirdPartyCookiesEnabled
          startInLoadingState
          scalesPageToFit
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
  },
  webViewContainer: {
    flex: 1,
  },
  webView: {
    flex: 1,
    backgroundColor: "black",
  },
});
