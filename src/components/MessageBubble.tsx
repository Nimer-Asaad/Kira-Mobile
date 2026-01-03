import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Message } from '../api/types';
import { COLORS } from '../utils/constants';

interface MessageBubbleProps {
  message: Message;
  isMyMessage: boolean;
}

export const MessageBubble: React.FC<MessageBubbleProps> = ({ message, isMyMessage }) => {
  const formattedTime = new Date(message.createdAt).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <View style={[styles.container, isMyMessage ? styles.myMessage : styles.theirMessage]}>
      {/* Sender name (only for other messages) */}
      {!isMyMessage && <Text style={styles.senderName}>{message.sender.name}</Text>}

      {/* Message bubble */}
      <View style={[styles.bubble, isMyMessage ? styles.myBubble : styles.theirBubble]}>
        <Text style={[styles.text, isMyMessage ? styles.myText : styles.theirText]}>
          {message.content}
        </Text>
      </View>

      {/* Timestamp */}
      <Text style={styles.timestamp}>{formattedTime}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
    maxWidth: '80%',
  },
  myMessage: {
    alignSelf: 'flex-end',
    alignItems: 'flex-end',
  },
  theirMessage: {
    alignSelf: 'flex-start',
    alignItems: 'flex-start',
  },
  senderName: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginBottom: 4,
    marginLeft: 12,
  },
  bubble: {
    borderRadius: 18,
    padding: 12,
    paddingHorizontal: 16,
  },
  myBubble: {
    backgroundColor: COLORS.primary,
  },
  theirBubble: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  text: {
    fontSize: 15,
    lineHeight: 20,
  },
  myText: {
    color: '#fff',
  },
  theirText: {
    color: COLORS.text,
  },
  timestamp: {
    fontSize: 11,
    color: COLORS.textSecondary,
    marginTop: 4,
    marginHorizontal: 12,
  },
});
