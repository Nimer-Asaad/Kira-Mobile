import { API_PATHS } from './apiPaths';
import { apiClient } from './client';
import { Task } from './types';

export const tasksApi = {
  // Get my assigned tasks
  async getMyTasks(): Promise<Task[]> {
    const response = await apiClient.get<Task[]>(API_PATHS.TASKS.MY);
    return response.data;
  },

  // Get single task
  async getTaskById(id: string): Promise<Task> {
    const response = await apiClient.get<Task>(API_PATHS.TASKS.BY_ID(id));
    return response.data;
  },

  // Update task status
  async updateTaskStatus(id: string, status: string): Promise<Task> {
    const response = await apiClient.patch<Task>(API_PATHS.TASKS.UPDATE_STATUS(id), { status });
    return response.data;
  },

  // Update checklist item
  async updateChecklistItem(taskId: string, itemId: string, completed: boolean): Promise<Task> {
    const response = await apiClient.patch<Task>(
      API_PATHS.TASKS.UPDATE_CHECKLIST(taskId, itemId),
      { completed }
    );
    return response.data;
  },
};
