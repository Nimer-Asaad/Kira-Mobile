import { useLocalSearchParams } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    FlatList,
    KeyboardAvoidingView,
    Platform,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { chatApi } from '../../../../../src/api/chat';
import { getErrorMessage } from '../../../../../src/api/client';
import { Message } from '../../../../../src/api/types';
import { useAuth } from '../../../../../src/auth/AuthContext';
import { MessageBubble } from '../../../../../src/components/MessageBubble';
import { COLORS } from '../../../../../src/utils/constants';

export default function ChatConversationScreen() {
  const { userModel, userId } = useLocalSearchParams<{ userModel: string; userId: string }>();
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [inputText, setInputText] = useState('');
  const flatListRef = useRef<FlatList>(null);
  const { user: currentUser } = useAuth();
  const pollingIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const loadMessages = async () => {
    if (!userId || !userModel) return;

    try {
      const data = await chatApi.getConversation(userModel, userId);
      setMessages(data.reverse()); // Reverse to show oldest at top
    } catch (error) {
      console.error('Failed to load messages:', getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async () => {
    if (!userId || !userModel) return;

    try {
      await chatApi.markAsRead(userModel, userId);
    } catch (error) {
      console.error('Failed to mark as read:', getErrorMessage(error));
    }
  };

  useEffect(() => {
    if (!userId || !userModel) return;

    // Load messages initially
    loadMessages();

    // Mark as read when opening conversation
    markAsRead();

    // Setup polling to reload messages every 5 seconds
    pollingIntervalRef.current = setInterval(() => {
      loadMessages();
    }, 5000);

    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId, userModel]);

  const handleSend = async () => {
    if (!inputText.trim() || sending || !userId || !userModel) return;

    const messageText = inputText.trim();
    setInputText('');
    setSending(true);

    try {
      const newMessage = await chatApi.sendMessage(userModel, userId, messageText);
      setMessages((prev) => [...prev, newMessage]);

      // Scroll to bottom
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    } catch (error) {
      console.error('Failed to send message:', getErrorMessage(error));
      setInputText(messageText); // Restore text on error
      Alert.alert('Error', 'Failed to send message. Please try again.');
    } finally {
      setSending(false);
    }
  };

  const renderMessage = ({ item }: { item: Message }) => {
    const isMyMessage = item.sender._id === currentUser?._id;
    return <MessageBubble message={item} isMyMessage={isMyMessage} />;
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={(item) => item._id}
        renderItem={renderMessage}
        contentContainerStyle={styles.messagesList}
        onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No messages yet</Text>
            <Text style={styles.emptySubtext}>Start the conversation!</Text>
          </View>
        }
      />

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Type a message..."
          placeholderTextColor={COLORS.textSecondary}
          value={inputText}
          onChangeText={setInputText}
          multiline
          maxLength={1000}
          editable={!sending}
        />
        <TouchableOpacity
          style={[styles.sendButton, (!inputText.trim() || sending) && styles.sendButtonDisabled]}
          onPress={handleSend}
          disabled={!inputText.trim() || sending}
        >
          {sending ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Text style={styles.sendButtonText}>Send</Text>
          )}
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
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
  messagesList: {
    padding: 16,
    paddingBottom: 8,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
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
  inputContainer: {
    flexDirection: 'row',
    padding: 12,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    alignItems: 'flex-end',
  },
  input: {
    flex: 1,
    backgroundColor: COLORS.backgroundDark,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    marginRight: 8,
    maxHeight: 100,
    fontSize: 15,
    color: COLORS.text,
  },
  sendButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 20,
    paddingHorizontal: 20,
    paddingVertical: 10,
    justifyContent: 'center',
    alignItems: 'center',
    minWidth: 60,
  },
  sendButtonDisabled: {
    opacity: 0.5,
  },
  sendButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 15,
  },
});
