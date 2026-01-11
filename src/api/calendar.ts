import { API_PATHS } from "./apiPaths";
import { apiClient } from "./client";
import { CalendarEvent } from "./types";

export const calendarApi = {
  // Get calendar events in date range
  async getEvents(from: string, to: string): Promise<CalendarEvent[]> {
    const response = await apiClient.get<CalendarEvent[]>(
      API_PATHS.PERSONAL.CALENDAR.LIST,
      {
        params: { from, to },
      }
    );
    return response.data;
  },

  // Get single event
  async getEventById(id: string): Promise<CalendarEvent> {
    const response = await apiClient.get<CalendarEvent>(
      API_PATHS.PERSONAL.CALENDAR.BY_ID(id)
    );
    return response.data;
  },

  // Create event
  async createEvent(eventData: {
    title: string;
    description?: string;
    location?: string;
    start: string;
    end: string;
    allDay?: boolean;
    color?: string;
    reminderMinutes?: number;
    reminderMethod?: string;
    repeat?: string;
    repeatUntil?: string;
  }): Promise<CalendarEvent> {
    const response = await apiClient.post<CalendarEvent>(
      API_PATHS.PERSONAL.CALENDAR.CREATE,
      eventData
    );
    return response.data;
  },

  // Update event
  async updateEvent(
    id: string,
    eventData: Partial<CalendarEvent>
  ): Promise<CalendarEvent> {
    const response = await apiClient.patch<CalendarEvent>(
      API_PATHS.PERSONAL.CALENDAR.UPDATE(id),
      eventData
    );
    return response.data;
  },

  // Delete event
  async deleteEvent(id: string): Promise<void> {
    await apiClient.delete(API_PATHS.PERSONAL.CALENDAR.DELETE(id));
  },
};
