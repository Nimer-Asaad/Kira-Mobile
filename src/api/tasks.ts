import { API_PATHS } from "./apiPaths";
import { apiClient } from "./client";
import { Task } from "./types";

export const tasksApi = {
  // Get tasks based on user role
  // Admin users get all tasks, HR users get all tasks (via admin endpoint if allowed, otherwise fallback)
  // Regular users and trainees get their assigned tasks
  async getMyTasks(userRole?: string): Promise<Task[]> {
    try {
      // Try admin endpoint for admin and HR users
      if (userRole === "admin" || userRole === "hr") {
        try {
          const response = await apiClient.get<Task[]>(API_PATHS.TASKS.ADMIN);
          return response.data;
        } catch (error: any) {
          // If HR can't access admin endpoint, fallback to my tasks
          if (userRole === "hr" && error.response?.status === 403) {
            const response = await apiClient.get<Task[]>(API_PATHS.TASKS.MY);
            return response.data;
          }
          throw error;
        }
      }
      // Regular users and trainees use my tasks endpoint
      const response = await apiClient.get<Task[]>(API_PATHS.TASKS.MY);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Get admin tasks (all tasks)
  async getAdminTasks(): Promise<Task[]> {
    const response = await apiClient.get<Task[]>(API_PATHS.TASKS.ADMIN);
    return response.data;
  },

  // Get single task
  async getTaskById(id: string): Promise<Task> {
    const response = await apiClient.get<Task>(API_PATHS.TASKS.BY_ID(id));
    return response.data;
  },

  // Update task status
  async updateTaskStatus(id: string, status: string): Promise<Task> {
    const response = await apiClient.patch<Task>(
      API_PATHS.TASKS.UPDATE_STATUS(id),
      { status }
    );
    return response.data;
  },

  // Update checklist item
  async updateChecklistItem(
    taskId: string,
    itemId: string,
    completed: boolean
  ): Promise<Task> {
    const response = await apiClient.patch<Task>(
      API_PATHS.TASKS.UPDATE_CHECKLIST(taskId, itemId),
      { completed }
    );
    return response.data;
  },

  // Create task (admin only)
  async createTask(taskData: {
    title: string;
    description: string;
    priority: string;
    dueDate: string;
    assignedTo?: string;
    checklist?: { text: string; done: boolean }[];
    attachments?: { name: string; url: string }[];
    requiredAssigneesCount?: number;
    ownerType?: string;
  }): Promise<Task> {
    const response = await apiClient.post<Task>(
      API_PATHS.TASKS.CREATE,
      taskData
    );
    return response.data;
  },

  // Delete task (admin only)
  async deleteTask(id: string): Promise<void> {
    await apiClient.delete(`${API_PATHS.TASKS.BY_ID(id)}`);
  },
};
