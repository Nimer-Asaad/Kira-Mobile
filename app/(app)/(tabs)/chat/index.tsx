import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    FlatList,
    RefreshControl,
    StyleSheet,
    Text,
    View,
} from 'react-native';
import { chatApi } from '../../../../src/api/chat';
import { getErrorMessage } from '../../../../src/api/client';
import { Conversation } from '../../../../src/api/types';
import { ConversationCard } from '../../../../src/components/ConversationCard';
import { COLORS } from '../../../../src/utils/constants';

export default function ChatListScreen() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const loadConversations = async () => {
    try {
      setErrorMessage(null);
      const data = await chatApi.getConversations();
      setConversations(data);
    } catch (error) {
      const msg = getErrorMessage(error);
      setErrorMessage(msg);
      console.error('Failed to load conversations:', msg);
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

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Messages</Text>
        <Text style={styles.headerSubtitle}>{conversations.length} conversations</Text>
      </View>

      {!!errorMessage && (
        <View style={styles.errorBanner}>
          <Text style={styles.errorText}>
            Failed to load conversations: {errorMessage}
          </Text>
          <Text style={styles.errorHint}>Pull down to retry.</Text>
        </View>
      )}

      <FlatList
        data={conversations}
        keyExtractor={(item, index) => item?.user?._id ?? String(index)}
        renderItem={({ item }) => <ConversationCard conversation={item} />}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No conversations yet</Text>
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
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    backgroundColor: '#fff',
    padding: 20,
    paddingTop: 60,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
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
  errorBanner: {
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  errorText: {
    color: '#b00020',
    fontSize: 13,
    fontWeight: '600',
  },
  errorHint: {
    color: COLORS.textSecondary,
    fontSize: 12,
    marginTop: 4,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 60,
  },
  emptyText: {
    fontSize: 16,
    color: COLORS.textSecondary,
  },
});
