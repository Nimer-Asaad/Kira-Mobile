import { API_PATHS } from "./apiPaths";
import { apiClient } from "./client";
import { User } from "./types";

export interface TeamMember {
  id: string;
  fullName: string;
  email: string;
  role: string;
  avatar?: string;
  stats: {
    pending: number;
    inProgress: number;
    completed: number;
  };
}

export const usersApi = {
  // Get all users (admin only)
  async getUsers(): Promise<User[]> {
    const response = await apiClient.get<User[]>(API_PATHS.USERS.LIST);
    return response.data;
  },

  // Get current user
  async getCurrentUser(): Promise<User> {
    const response = await apiClient.get<User>(API_PATHS.USERS.ME);
    return response.data;
  },

  // Get team stats (admin only)
  async getTeamStats(): Promise<TeamMember[]> {
    const response = await apiClient.get<any[]>(API_PATHS.USERS.TEAM_STATS);
    // Transform response to match TeamMember interface
    return response.data.map((member: any) => {
      const user = member.user || member;
      const stats = member.stats || {};
      return {
        id: user._id || member._id,
        fullName: user.fullName || "User",
        email: user.email || "",
        role: user.role || "user",
        avatar: user.avatar || "",
        stats: {
          pending: stats.pending || 0,
          inProgress: stats.inProgress || 0,
          completed: stats.completed || 0,
        },
      };
    });
  },

  // Get user by ID
  async getUserById(id: string): Promise<User> {
    const response = await apiClient.get<User>(API_PATHS.USERS.BY_ID(id));
    return response.data;
  },
};
