import { API_PATHS } from "./apiPaths";
import { apiClient } from "./client";

export interface TraineeDashboard {
  trainee: {
    _id: string;
    fullName: string;
    email: string;
    position?: string;
    status: string;
  };
  points: {
    totalEarned: number;
    avgPerReviewed: number;
  };
  timing: {
    onTime: number;
    early: number;
    late: number;
  };
  totals: {
    totalTasks: number;
    pendingTasks: number;
    inProgressTasks: number;
    submittedTasks: number;
    reviewedTasks: number;
    completionRate: number;
  };
  recent: {
    taskId: string;
    title: string;
    status: string;
    earnedPoints?: number;
    updatedAt: string;
  }[];
}

export interface TraineeTask {
  _id: string;
  title: string;
  description?: string;
  status: string;
  dueDate?: string;
  earnedPoints?: number;
  maxPoints?: number;
  submittedAt?: string;
  reviewedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export const traineeApi = {
  // Get trainee dashboard
  async getDashboard(): Promise<TraineeDashboard> {
    const response = await apiClient.get<TraineeDashboard>(
      API_PATHS.TRAINEE.DASHBOARD
    );
    return response.data;
  },

  // Get trainee tasks
  async getMyTasks(): Promise<{
    tasks: TraineeTask[];
    progress: { completed: number; total: number };
    traineeStatus?: {
      status: string;
      pausedReason?: string;
      frozenReason?: string;
      cancelReason?: string;
      withdrawReason?: string;
    };
  }> {
    const response = await apiClient.get<{
      tasks: TraineeTask[];
      progress: { completed: number; total: number };
      traineeStatus?: any;
    }>(API_PATHS.TRAINEE.TASKS);
    return response.data;
  },

  // Submit task
  async submitTask(
    taskId: string,
    submission: {
      repoUrl?: string;
      codeSnippet?: string;
      notes?: string;
    }
  ): Promise<{ task: TraineeTask; points?: number; breakdown?: any }> {
    const response = await apiClient.post<{
      task: TraineeTask;
      points?: number;
      breakdown?: any;
    }>(API_PATHS.TRAINEE.SUBMIT_TASK(taskId), submission);
    return response.data;
  },
};
