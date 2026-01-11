/**
 * API Path Configuration
 * Maps all backend endpoints for easy maintenance
 */

export const API_PATHS = {
  // Auth endpoints
  AUTH: {
    LOGIN: "/auth/login",
    SIGNUP: "/auth/signup",
    ME: "/auth/me",
    UPDATE_ME: "/auth/me",
  },

  // Task endpoints
  TASKS: {
    MY: "/tasks/my",
    ADMIN: "/tasks/admin",
    CREATE: "/tasks",
    BY_ID: (id: string) => `/tasks/${id}`,
    UPDATE_STATUS: (id: string) => `/tasks/${id}/status`,
    UPDATE_CHECKLIST: (taskId: string, itemId: string) =>
      `/tasks/${taskId}/checklist/${itemId}`,
    STATS: "/tasks/stats",
  },

  // Chat endpoints
  CHAT: {
    CONVERSATIONS: "/chat/conversations",
    CONVERSATION: (userModel: string, userId: string) =>
      `/chat/conversation/${userModel}/${userId}`,
    SEND: "/chat/send",
    MARK_READ: "/chat/mark-read",
    UNREAD_COUNT: "/chat/unread-count",
    AVAILABLE_USERS: "/chat/available-users",
  },

  // Personal endpoints
  PERSONAL: {
    TASKS: {
      LIST: "/personal/tasks",
      BY_ID: (id: string) => `/personal/tasks/${id}`,
      CREATE: "/personal/tasks",
      UPDATE: (id: string) => `/personal/tasks/${id}`,
      DELETE: (id: string) => `/personal/tasks/${id}`,
    },
    CALENDAR: {
      LIST: "/personal/calendar",
      BY_ID: (id: string) => `/personal/calendar/${id}`,
      CREATE: "/personal/calendar",
      UPDATE: (id: string) => `/personal/calendar/${id}`,
      DELETE: (id: string) => `/personal/calendar/${id}`,
    },
    PLANNER: {
      GET_DAY: "/personal/planner",
      UPSERT: "/personal/planner",
      UPDATE_BLOCK: (blockId: string) => `/personal/planner/block/${blockId}`,
    },
  },

  // User endpoints
  USERS: {
    LIST: "/users",
    ME: "/users/me",
    BY_ID: (id: string) => `/users/${id}`,
    AVATAR: "/users/me/avatar",
    TEAM_STATS: "/users/team/stats",
    UPDATE_ROLE: (id: string) => `/users/${id}/role`,
    STATS: (id: string) => `/users/${id}/stats`,
  },

  // Trainee endpoints
  TRAINEE: {
    DASHBOARD: "/trainee/me/dashboard",
    TASKS: "/trainee/me/tasks",
    SUBMIT_TASK: (taskId: string) => `/trainee/tasks/${taskId}/submit`,
    WITHDRAW_REQUEST: "/trainee/me/withdraw-request",
  },

  // Gmail/Inbox endpoints
  GMAIL: {
    STATUS: "/hr/gmail/status",
    SYNC: "/hr/gmail/sync",
    EMAILS: "/hr/gmail/emails",
    EMAIL_BY_ID: (id: string) => `/hr/gmail/emails/${id}`,
    EMAIL_AI_SUMMARY: (id: string) => `/hr/gmail/emails/${id}/ai`,
    LOCAL_SEARCH: "/gmail/local/search",
    SYNC_PAGE: "/gmail/sync-page",
    SYNC_STATE: "/gmail/sync/state",
    AUTH: "/gmail/auth",
  },
};

export default API_PATHS;
