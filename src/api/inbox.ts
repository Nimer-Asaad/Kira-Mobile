import { API_PATHS } from "./apiPaths";
import { apiClient } from "./client";

export interface GmailStatus {
  status: "connected" | "not_configured" | "not_connected";
  lastSync?: string | null;
  syncedCount?: number;
  totalMessages?: number;
  message?: string;
}

export interface Email {
  _id: string;
  gmailId: string;
  threadId?: string;
  from: string;
  to: string;
  subject: string;
  body: string;
  date: string;
  labelIds?: string[];
  hasAttachments?: boolean;
  attachments?: Array<{
    filename: string;
    mimeType: string;
    size: number;
    attachmentId: string;
  }>;
  snippet?: string;
  isRead?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface EmailSearchResponse {
  emails: Email[];
  count: number;
}

export interface SyncState {
  lastSyncedAt?: string | null;
  syncedCount?: number;
  totalMessages?: number;
  updatedAt?: string;
}

export const inboxApi = {
  // Get Gmail connection status
  async getStatus(): Promise<GmailStatus> {
    try {
      const response = await apiClient.get<GmailStatus>(API_PATHS.GMAIL.STATUS);
      return response.data;
    } catch (error: any) {
      if (error.response?.status === 503) {
        return {
          status: "not_configured",
          message: "Gmail is not configured on the server.",
        };
      } else if (error.response?.status === 401) {
        return {
          status: "not_connected",
          message: "Gmail not connected. Please connect your account.",
        };
      }
      throw error;
    }
  },

  // Get sync state
  async getSyncState(params?: { scope?: string }): Promise<SyncState> {
    const response = await apiClient.get<SyncState>(API_PATHS.GMAIL.SYNC_STATE, {
      params,
    });
    return response.data;
  },

  // Search emails locally
  async searchEmails(params: {
    keyword?: string;
    labelIds?: string;
    startDate?: string;
    endDate?: string;
    limit?: number;
    skip?: number;
  }): Promise<EmailSearchResponse> {
    const response = await apiClient.get<EmailSearchResponse>(
      API_PATHS.GMAIL.LOCAL_SEARCH,
      { params }
    );
    return response.data;
  },

  // Sync emails from Gmail
  async syncEmails(data: {
    label?: string;
    maxResults?: number;
  }): Promise<{ message: string; syncedCount: number; totalMessages: number }> {
    const response = await apiClient.post<{
      message: string;
      syncedCount: number;
      totalMessages: number;
    }>(API_PATHS.GMAIL.SYNC, data);
    return response.data;
  },

  // Sync emails by page (for paginated syncing)
  async syncPage(data: {
    limit?: number;
    pageToken?: string | null;
    labelIds?: string[];
    scope?: string;
    startDate?: string;
    endDate?: string;
  }): Promise<{
    synced: number;
    skipped: number;
    nextPageToken?: string | null;
  }> {
    const response = await apiClient.post<{
      synced: number;
      skipped: number;
      nextPageToken?: string | null;
    }>(API_PATHS.GMAIL.SYNC_PAGE, data);
    return response.data;
  },

  // Get email details
  async getEmailById(id: string): Promise<Email> {
    const response = await apiClient.get<Email>(
      API_PATHS.GMAIL.EMAIL_BY_ID(id)
    );
    return response.data;
  },

  // Generate AI summary for email
  async generateSummary(id: string): Promise<{ summary: string }> {
    const response = await apiClient.post<{ summary: string }>(
      API_PATHS.GMAIL.EMAIL_AI_SUMMARY(id)
    );
    return response.data;
  },

  // Get Gmail auth URL
  getAuthUrl(token: string, baseUrl: string): string {
    // Construct full URL with base API URL
    return `${baseUrl}${API_PATHS.GMAIL.AUTH}?token=${encodeURIComponent(token)}`;
  },
};
