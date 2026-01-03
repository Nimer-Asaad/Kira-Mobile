import { API_PATHS } from './apiPaths';
import { apiClient } from './client';
import { Conversation, Message } from './types';

export const chatApi = {
  // Send message
  async sendMessage(receiverModel: string, receiverId: string, content: string): Promise<Message> {
    const response = await apiClient.post<Message>(API_PATHS.CHAT.SEND, {
      receiverModel,
      receiverId,
      content,
    });
    return response.data;
  },

  // Get conversation with a specific user
  async getConversation(userModel: string, userId: string): Promise<Message[]> {
    const response = await apiClient.get<Message[]>(
      API_PATHS.CHAT.CONVERSATION(userModel, userId)
    );
    return response.data;
  },

  // Get all conversations
  async getConversations(): Promise<Conversation[]> {
    const response = await apiClient.get<Conversation[]>(API_PATHS.CHAT.CONVERSATIONS);
    return response.data;
  },

  // Get unread count
  async getUnreadCount(): Promise<number> {
    const response = await apiClient.get<{ count: number }>(API_PATHS.CHAT.UNREAD_COUNT);
    return response.data.count;
  },

  // Mark messages as read
  async markAsRead(userModel: string, userId: string): Promise<void> {
    await apiClient.post(API_PATHS.CHAT.MARK_READ, {
      senderModel: userModel,
      senderId: userId,
    });
  },

  // Get available users to chat with
  async getAvailableUsers(): Promise<any[]> {
    const response = await apiClient.get(API_PATHS.CHAT.AVAILABLE_USERS);
    return response.data;
  },
};
