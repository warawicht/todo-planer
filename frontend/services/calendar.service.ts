import axios from 'axios';
import { CalendarViewResponse, CalendarViewQuery, CalendarViewPreference } from '../types/calendar.types';

// Configure axios base URL (adjust according to your backend URL)
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

// Create axios instance with default config
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true, // Important for cookie-based authentication
});

// Add a request interceptor to include auth token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export class CalendarService {
  static async getCalendarView(query: CalendarViewQuery): Promise<CalendarViewResponse> {
    try {
      // In a real implementation, this calls the backend API
      const response = await apiClient.get('/time-blocks/calendar', {
        params: {
          view: query.view,
          referenceDate: query.referenceDate.toISOString(),
          userId: query.userId
        }
      });
      
      // Transform the response to match our expected format
      return {
        ...response.data,
        startDate: new Date(response.data.startDate),
        endDate: new Date(response.data.endDate),
        referenceDate: new Date(response.data.referenceDate),
        timeBlocks: response.data.timeBlocks.map((block: any) => ({
          ...block,
          startTime: new Date(block.startTime),
          endTime: new Date(block.endTime)
        }))
      };
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch calendar data');
    }
  }
  
  static async getViewPreference(userId: string): Promise<CalendarViewPreference> {
    try {
      const response = await apiClient.get(`/users/${userId}/calendar-preference`);
      return {
        ...response.data,
        updatedAt: new Date(response.data.updatedAt)
      };
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch view preference');
    }
  }
  
  static async updateViewPreference(userId: string, preference: Partial<CalendarViewPreference>): Promise<CalendarViewPreference> {
    try {
      const response = await apiClient.put(`/users/${userId}/calendar-preference`, preference);
      return {
        ...response.data,
        updatedAt: new Date(response.data.updatedAt)
      };
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to update view preference');
    }
  }
}