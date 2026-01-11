import { useRouter } from "expo-router";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Conversation } from "../api/types";
import { COLORS } from "../utils/constants";

interface ConversationCardProps {
  conversation: Conversation;
}

export const ConversationCard: React.FC<ConversationCardProps> = ({
  conversation,
}) => {
  const router = useRouter();

  const handlePress = () => {
    // Navigate with userModel and userId
    const userModel =
      conversation.userModel ||
      conversation.user.userModel ||
      conversation.user.model ||
      "User";
    router.push(
      `/(app)/(tabs)/chat/${userModel}/${conversation.user._id}` as any
    );
  };

  const formattedTime = new Date(
    conversation.lastMessage.createdAt
  ).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <TouchableOpacity style={styles.container} onPress={handlePress}>
      {/* Avatar */}
      <View style={styles.avatar}>
        <Text style={styles.avatarText}>
          {(conversation.user.fullName || conversation.user.name || "U")
            .charAt(0)
            .toUpperCase()}
        </Text>
      </View>

      {/* Content */}
      <View style={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.userName} numberOfLines={1}>
            {conversation.user.fullName || conversation.user.name || "User"}
          </Text>
          {conversation.unreadCount > 0 && (
            <View style={styles.unreadBadge}>
              <Text style={styles.unreadText}>{conversation.unreadCount}</Text>
            </View>
          )}
        </View>

        {/* Message preview */}
        <Text style={styles.lastMessage} numberOfLines={1}>
          {conversation.lastMessage.content}
        </Text>

        {/* Timestamp */}
        <Text style={styles.timestamp}>{formattedTime}</Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    alignItems: "center",
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: COLORS.primary,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
    flexShrink: 0,
  },
  avatarText: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "bold",
  },
  content: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  userName: {
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.text,
    flex: 1,
  },
  unreadBadge: {
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginLeft: 8,
  },
  unreadText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "bold",
  },
  lastMessage: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginBottom: 4,
  },
  timestamp: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
});
