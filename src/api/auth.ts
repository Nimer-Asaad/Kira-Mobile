import { API_PATHS } from './apiPaths';
import { apiClient } from './client';
import { AuthResponse, LoginCredentials, SignupData, User } from './types';

export const authApi = {
  // Login
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const response = await apiClient.post<AuthResponse>(API_PATHS.AUTH.LOGIN, credentials);
    return response.data;
  },

  // Signup
  async signup(data: SignupData): Promise<AuthResponse> {
    const response = await apiClient.post<AuthResponse>(API_PATHS.AUTH.SIGNUP, data);
    return response.data;
  },

  // Get current user profile
  async getMe(): Promise<User> {
    const response = await apiClient.get<User>(API_PATHS.AUTH.ME);
    return response.data;
  },

  // Update current user profile
  async updateMe(data: Partial<User>): Promise<User> {
    const response = await apiClient.put<User>(API_PATHS.AUTH.UPDATE_ME, data);
    return response.data;
  },
};
