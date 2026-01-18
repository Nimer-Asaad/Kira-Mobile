import { useRouter } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Linking,
  RefreshControl,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { getErrorMessage } from "../../../../src/api/client";
import { Email, GmailStatus, inboxApi } from "../../../../src/api/inbox";
import { useAuth } from "../../../../src/auth/AuthContext";
import { API_URL, COLORS, STORAGE_KEYS } from "../../../../src/utils/constants";
import { storage } from "../../../../src/utils/storage";

export default function InboxScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const [emails, setEmails] = useState<Email[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [gmailStatus, setGmailStatus] = useState<GmailStatus | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [label, setLabel] = useState("INBOX");
  const [page, setPage] = useState(1);
  const [totalEmails, setTotalEmails] = useState(0);
  const limit = 20;
  const isMountedRef = useRef(true);
  const abortControllerRef = useRef<AbortController | null>(null);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    isMountedRef.current = true;
    // If the current user is not HR, skip Gmail checks (personal/company gating)
    // Admins are explicitly denied access to Inbox content
    if (user?.role === "admin") {
      setLoading(false);
      return;
    }
    if (user?.role !== "hr") {
      setLoading(false);
      return;
    }
    checkGmailStatus();

    return () => {
      isMountedRef.current = false;
      // Cancel any ongoing requests
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      // Clear search timeout
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (gmailStatus?.status === "connected" && isMountedRef.current) {
      // Debounce search queries
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }

      searchTimeoutRef.current = setTimeout(
        () => {
          if (isMountedRef.current) {
            fetchEmails();
          }
        },
        searchQuery ? 500 : 0
      ); // 500ms delay for search, immediate for other changes
    }

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [gmailStatus, label, searchQuery, page]);

  const checkGmailStatus = async () => {
    try {
      if (!isMountedRef.current) return;

      setLoading(true);
      const status = await inboxApi.getStatus();

      if (!isMountedRef.current) return;

      setGmailStatus(status);
    } catch (error: any) {
      // Don't show alert if component is unmounted or request was aborted
      if (
        !isMountedRef.current ||
        error.name === "AbortError" ||
        error.code === "ERR_CANCELED"
      ) {
        return;
      }
      console.error("Failed to check Gmail status:", getErrorMessage(error));
      if (isMountedRef.current) {
        setGmailStatus({
          status: "not_connected",
          message: "Failed to check Gmail status",
        });
      }
    } finally {
      if (isMountedRef.current) {
        setLoading(false);
      }
    }
  };

  const fetchEmails = async () => {
    // Cancel previous request if any
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // Create new abort controller for this request
    abortControllerRef.current = new AbortController();

    try {
      if (!isMountedRef.current) return;

      setLoading(true);
      const params: any = {
        limit,
        skip: (page - 1) * limit,
      };
      if (searchQuery) params.keyword = searchQuery;
      if (label !== "ALL") params.labelIds = label;

      const response = await inboxApi.searchEmails(params);

      if (!isMountedRef.current) return;

      setEmails(response.emails || []);
      setTotalEmails(response.count || 0);
    } catch (error: any) {
      // Don't show alert if component is unmounted or request was aborted
      if (
        !isMountedRef.current ||
        error.name === "AbortError" ||
        error.code === "ERR_CANCELED"
      ) {
        return;
      }

      // Don't show alert for network errors (likely navigation-related)
      const errorMessage = getErrorMessage(error);
      const isNetworkError =
        errorMessage.toLowerCase().includes("network") ||
        errorMessage.toLowerCase().includes("timeout") ||
        error.code === "ERR_NETWORK" ||
        error.message === "Network Error";

      console.error("Failed to fetch emails:", errorMessage);

      // Only show alert for non-network errors and if component is still mounted
      if (isMountedRef.current && !isNetworkError) {
        Alert.alert("Error", errorMessage);
      }
    } finally {
      if (isMountedRef.current) {
        setLoading(false);
        setRefreshing(false);
      }
    }
  };

  const handleConnectGmail = async () => {
    try {
      const token = await storage.getItem(STORAGE_KEYS.AUTH_TOKEN);
      if (!token) {
        Alert.alert("Error", "Please login first");
        return;
      }

      // Get the auth URL from backend
      const authUrl = inboxApi.getAuthUrl(token, API_URL);

      // Open in browser/WebView
      const canOpen = await Linking.canOpenURL(authUrl);
      if (canOpen) {
        await Linking.openURL(authUrl);
        Alert.alert(
          "Gmail Connection",
          "Please complete the Gmail authorization in your browser. After connecting, return to the app and refresh."
        );
      } else {
        Alert.alert("Error", "Cannot open Gmail authorization URL");
      }
    } catch (error) {
      console.error("Failed to connect Gmail:", getErrorMessage(error));
      Alert.alert("Error", getErrorMessage(error));
    }
  };

  const handleSync = async () => {
    try {
      setSyncing(true);
      const result = await inboxApi.syncEmails({
        label: label === "ALL" ? "INBOX" : label,
        maxResults: 50,
      });
      Alert.alert("Success", `Synced ${result.syncedCount} emails`);
      await checkGmailStatus();
      await fetchEmails();
    } catch (error) {
      console.error("Failed to sync emails:", getErrorMessage(error));
      Alert.alert("Error", getErrorMessage(error));
    } finally {
      setSyncing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    checkGmailStatus();
    if (gmailStatus?.status === "connected") {
      fetchEmails();
    }
  };

  const renderEmail = ({ item }: { item: Email }) => {
    const date = new Date(item.date);
    const formattedDate = date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year:
        date.getFullYear() !== new Date().getFullYear() ? "numeric" : undefined,
    });

    return (
      <TouchableOpacity
        style={styles.emailCard}
        onPress={() => {
          // Navigate to email details
          router.push(`/(app)/(tabs)/inbox/${item._id}` as any);
        }}
      >
        <View style={styles.emailHeader}>
          <Text style={styles.emailFrom} numberOfLines={1}>
            {item.from}
          </Text>
          <Text style={styles.emailDate}>{formattedDate}</Text>
        </View>
        <Text style={styles.emailSubject} numberOfLines={1}>
          {item.subject || "(No Subject)"}
        </Text>
        {item.snippet && (
          <Text style={styles.emailSnippet} numberOfLines={2}>
            {item.snippet}
          </Text>
        )}
        {item.hasAttachments && (
          <View style={styles.attachmentBadge}>
            <Text style={styles.attachmentText}>📎 Attachment</Text>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  if (loading && !gmailStatus) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  // Deny access to admin users explicitly
  if (user?.role === "admin") {
    return (
      <View style={styles.centerContainer}>
        <Text style={{ fontSize: 18, color: COLORS.text }}>
          You can't see this
        </Text>
      </View>
    );
  }

  if (gmailStatus?.status === "not_configured") {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Inbox</Text>
          <Text style={styles.subtitle}>Gmail Not Configured</Text>
        </View>
        <View style={styles.placeholderContent}>
          <Text style={styles.placeholderText}>⚙️</Text>
          <Text style={styles.placeholderTitle}>Gmail Not Configured</Text>
          <Text style={styles.placeholderDescription}>
            {gmailStatus.message ||
              "Gmail is not configured on the server. Contact admin to set up Google credentials."}
          </Text>
        </View>
      </View>
    );
  }

  if (gmailStatus?.status === "not_connected") {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Inbox</Text>
          <Text style={styles.subtitle}>Connect Gmail</Text>
        </View>
        <View style={styles.placeholderContent}>
          <Text style={styles.placeholderText}>📬</Text>
          <Text style={styles.placeholderTitle}>Connect Your Gmail</Text>
          <Text style={styles.placeholderDescription}>
            Connect your Gmail account to manage emails and convert them to
            applicants.
          </Text>
          <TouchableOpacity
            style={styles.connectButton}
            onPress={handleConnectGmail}
          >
            <Text style={styles.connectButtonText}>Connect Gmail</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Inbox</Text>
        <Text style={styles.subtitle}>
          {totalEmails} {totalEmails === 1 ? "email" : "emails"}
        </Text>
        <View style={styles.headerActions}>
          <TouchableOpacity
            style={styles.syncButton}
            onPress={handleSync}
            disabled={syncing}
          >
            {syncing ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Text style={styles.syncButtonText}>Sync</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search emails..."
          placeholderTextColor={COLORS.textSecondary}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      <View style={styles.labelContainer}>
        <TouchableOpacity
          style={[
            styles.labelButton,
            label === "INBOX" && styles.labelButtonActive,
          ]}
          onPress={() => setLabel("INBOX")}
        >
          <Text
            style={[
              styles.labelButtonText,
              label === "INBOX" && styles.labelButtonTextActive,
            ]}
          >
            Inbox
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.labelButton,
            label === "ALL" && styles.labelButtonActive,
          ]}
          onPress={() => setLabel("ALL")}
        >
          <Text
            style={[
              styles.labelButtonText,
              label === "ALL" && styles.labelButtonTextActive,
            ]}
          >
            All
          </Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      ) : (
        <FlatList
          data={emails}
          keyExtractor={(item) => item._id}
          renderItem={renderEmail}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No emails found</Text>
              <Text style={styles.emptySubtext}>
                {searchQuery
                  ? "Try adjusting your search"
                  : "Sync emails to get started"}
              </Text>
            </View>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.backgroundDark,
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  header: {
    backgroundColor: "#fff",
    padding: 20,
    paddingTop: 60,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: COLORS.text,
  },
  subtitle: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginTop: 4,
  },
  headerActions: {
    flexDirection: "row",
    marginTop: 12,
    gap: 8,
  },
  syncButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  syncButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
  searchContainer: {
    backgroundColor: "#fff",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  searchInput: {
    backgroundColor: COLORS.backgroundDark,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 14,
    color: COLORS.text,
  },
  labelContainer: {
    flexDirection: "row",
    backgroundColor: "#fff",
    paddingHorizontal: 16,
    paddingVertical: 8,
    gap: 8,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  labelButton: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: COLORS.backgroundDark,
  },
  labelButtonActive: {
    backgroundColor: COLORS.primary,
  },
  labelButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.text,
  },
  labelButtonTextActive: {
    color: "#fff",
  },
  listContent: {
    padding: 16,
  },
  emailCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  emailHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  emailFrom: {
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.text,
    flex: 1,
  },
  emailDate: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  emailSubject: {
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.text,
    marginBottom: 4,
  },
  emailSnippet: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginTop: 4,
  },
  attachmentBadge: {
    alignSelf: "flex-start",
    marginTop: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: COLORS.backgroundDark,
    borderRadius: 12,
  },
  attachmentText: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  placeholderContent: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 32,
    paddingTop: 60,
  },
  placeholderText: {
    fontSize: 64,
    marginBottom: 16,
  },
  placeholderTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: COLORS.text,
    textAlign: "center",
    marginBottom: 8,
  },
  placeholderDescription: {
    fontSize: 14,
    color: COLORS.textSecondary,
    textAlign: "center",
    marginBottom: 24,
    lineHeight: 20,
  },
  connectButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  connectButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 60,
  },
  emptyText: {
    fontSize: 16,
    color: COLORS.textSecondary,
    marginBottom: 4,
  },
  emptySubtext: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
});
