import { API_PATHS } from "./apiPaths";
import { apiClient } from "./client";
import { Conversation, Message } from "./types";

export const chatApi = {
  // Send message
  async sendMessage(
    receiverModel: string,
    receiverId: string,
    content: string
  ): Promise<Message> {
    const response = await apiClient.post<{ message: string; data: Message }>(
      API_PATHS.CHAT.SEND,
      {
        receiverId,
        receiverModel,
        content,
      }
    );
    return response.data.data;
  },

  // Get conversation with a specific user
  async getConversation(userModel: string, userId: string): Promise<Message[]> {
    const response = await apiClient.get<{ messages: Message[] }>(
      API_PATHS.CHAT.CONVERSATION(userModel, userId)
    );
    return response.data.messages || [];
  },

  // Get all conversations
  async getConversations(): Promise<Conversation[]> {
    const response = await apiClient.get<{ conversations: Conversation[] }>(
      API_PATHS.CHAT.CONVERSATIONS
    );
    return response.data.conversations || [];
  },

  // Get unread count
  async getUnreadCount(): Promise<number> {
    const response = await apiClient.get<{ count: number }>(
      API_PATHS.CHAT.UNREAD_COUNT
    );
    return response.data.count;
  },

  // Mark messages as read
  async markAsRead(messageIds: string[]): Promise<void> {
    if (!messageIds || messageIds.length === 0) {
      return; // No messages to mark as read
    }
    await apiClient.post(API_PATHS.CHAT.MARK_READ, {
      messageIds,
    });
  },

  // Get available users to chat with
  async getAvailableUsers(): Promise<any[]> {
    const response = await apiClient.get<{ users: any[] }>(
      API_PATHS.CHAT.AVAILABLE_USERS
    );
    return response.data.users || [];
  },
};
