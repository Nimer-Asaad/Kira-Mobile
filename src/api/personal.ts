import { API_PATHS } from './apiPaths';
import { apiClient } from './client';
import { CalendarEvent, DayPlan, PersonalTask } from './types';

// Personal Tasks API
export const personalTasksApi = {
  async getAll(): Promise<PersonalTask[]> {
    const response = await apiClient.get<PersonalTask[]>(API_PATHS.PERSONAL.TASKS.LIST);
    return response.data;
  },

  async getById(id: string): Promise<PersonalTask> {
    const response = await apiClient.get<PersonalTask>(API_PATHS.PERSONAL.TASKS.BY_ID(id));
    return response.data;
  },

  async create(data: Partial<PersonalTask>): Promise<PersonalTask> {
    const response = await apiClient.post<PersonalTask>(API_PATHS.PERSONAL.TASKS.CREATE, data);
    return response.data;
  },

  async update(id: string, data: Partial<PersonalTask>): Promise<PersonalTask> {
    const response = await apiClient.patch<PersonalTask>(
      API_PATHS.PERSONAL.TASKS.UPDATE(id),
      data
    );
    return response.data;
  },

  async delete(id: string): Promise<void> {
    await apiClient.delete(API_PATHS.PERSONAL.TASKS.DELETE(id));
  },
};

// Calendar API
export const calendarApi = {
  async getEvents(from?: string, to?: string): Promise<CalendarEvent[]> {
    const params = new URLSearchParams();
    if (from) params.append('from', from);
    if (to) params.append('to', to);
    
    const response = await apiClient.get<CalendarEvent[]>(
      `${API_PATHS.PERSONAL.CALENDAR.LIST}?${params}`
    );
    return response.data;
  },

  async getById(id: string): Promise<CalendarEvent> {
    const response = await apiClient.get<CalendarEvent>(API_PATHS.PERSONAL.CALENDAR.BY_ID(id));
    return response.data;
  },

  async create(data: Partial<CalendarEvent>): Promise<CalendarEvent> {
    const response = await apiClient.post<CalendarEvent>(API_PATHS.PERSONAL.CALENDAR.CREATE, data);
    return response.data;
  },

  async update(id: string, data: Partial<CalendarEvent>): Promise<CalendarEvent> {
    const response = await apiClient.patch<CalendarEvent>(
      API_PATHS.PERSONAL.CALENDAR.UPDATE(id),
      data
    );
    return response.data;
  },

  async delete(id: string): Promise<void> {
    await apiClient.delete(API_PATHS.PERSONAL.CALENDAR.DELETE(id));
  },
};

// Planner API
export const plannerApi = {
  async getDayPlan(date: string): Promise<DayPlan> {
    const response = await apiClient.get<DayPlan>(
      `${API_PATHS.PERSONAL.PLANNER.GET_DAY}?date=${date}`
    );
    return response.data;
  },

  async upsertDayPlan(date: string, blocks: any[], notes?: string): Promise<DayPlan> {
    const response = await apiClient.put<DayPlan>(
      `${API_PATHS.PERSONAL.PLANNER.UPSERT}?date=${date}`,
      { blocks, notes }
    );
    return response.data;
  },

  async updateBlock(blockId: string, data: any): Promise<DayPlan> {
    const response = await apiClient.patch<DayPlan>(
      API_PATHS.PERSONAL.PLANNER.UPDATE_BLOCK(blockId),
      data
    );
    return response.data;
  },
};
