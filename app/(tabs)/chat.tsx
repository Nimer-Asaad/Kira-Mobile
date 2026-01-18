import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { chatApi } from "../../src/api/chat";
import { getErrorMessage } from "../../src/api/client";
import { Conversation } from "../../src/api/types";
import { ConversationCard } from "../../src/components/ConversationCard";
import { useThemedColors } from "../../src/hooks/use-themed-colors";
import { COLORS } from "../../src/utils/constants";

export default function ChatScreen() {
  const themedColors = useThemedColors();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const router = useRouter();

  const loadConversations = async () => {
    try {
      const data = await chatApi.getConversations();
      setConversations(data);
    } catch (error) {
      console.error("Failed to load conversations:", getErrorMessage(error));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadConversations();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    loadConversations();
  };

  const renderConversation = ({ item }: { item: Conversation }) => (
    <ConversationCard conversation={item} />
  );

  if (loading) {
    return (
      <View
        style={[
          styles.centerContainer,
          { backgroundColor: themedColors.background },
        ]}
      >
        <ActivityIndicator size="large" color={themedColors.tint} />
      </View>
    );
  }

  return (
    <View
      style={[styles.container, { backgroundColor: themedColors.background }]}
    >
      <View
        style={[styles.header, { borderBottomColor: themedColors.icon + "20" }]}
      >
        <Text style={[styles.headerTitle, { color: themedColors.text }]}>
          Messages
        </Text>
        <Text style={[styles.headerSubtitle, { color: themedColors.icon }]}>
          {conversations.length} conversations
        </Text>
      </View>

      <FlatList
        data={conversations}
        keyExtractor={(item) => item.user._id}
        renderItem={renderConversation}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={[styles.emptyText, { color: themedColors.icon }]}>
              No conversations yet
            </Text>
          </View>
        }
      />
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
  headerTitle: {
    fontSize: 28,
    fontWeight: "bold",
    color: COLORS.text,
  },
  headerSubtitle: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginTop: 4,
  },
  listContent: {
    padding: 16,
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 60,
  },
  emptyText: {
    fontSize: 16,
    color: COLORS.textSecondary,
  },
});
