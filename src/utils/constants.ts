// API Configuration
export const API_URL = __DEV__
  ? "http://10.0.2.2:8000/api" // Development
  : "https://your-production-api.com/api"; // Production

// Storage Keys
export const STORAGE_KEYS = {
  AUTH_TOKEN: "auth_token",
  USER_DATA: "user_data",
  KIRA_MODE: "kira_mode",
};

// Task Status
export const TASK_STATUS = {
  PENDING: "pending",
  IN_PROGRESS: "in-progress",
  COMPLETED: "completed",
};

// Re-export theme colors for backward compatibility
export { COLORS, RADIUS, SHADOWS, SPACING, TYPOGRAPHY } from "../theme";
