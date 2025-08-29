import axios from 'axios';
import { DashboardWidget, DashboardConfigDto } from '../types/dashboard.types';

// Configure axios base URL (adjust according to your backend URL)
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
const DASHBOARD_API_URL = `${API_BASE_URL}/productivity/dashboard`;

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

export class DashboardService {
  // Retrieve dashboard configuration and data
  static async getDashboard(userId: string): Promise<{ widgets: DashboardWidget[] }> {
    try {
      const response = await apiClient.get(DASHBOARD_API_URL, {
        params: { userId }
      });
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch dashboard data');
    }
  }

  // Add a new widget to the dashboard
  static async addWidget(widgetConfig: DashboardConfigDto): Promise<DashboardWidget> {
    try {
      const response = await apiClient.post(`${DASHBOARD_API_URL}/widgets`, widgetConfig);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to add widget');
    }
  }

  // Update widget configuration
  static async updateWidget(
    id: string,
    userId: string,
    config: Partial<DashboardConfigDto>
  ): Promise<DashboardWidget> {
    try {
      const response = await apiClient.put(`${DASHBOARD_API_URL}/widgets/${id}`, config, {
        params: { userId }
      });
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to update widget');
    }
  }

  // Remove a widget from the dashboard
  static async removeWidget(id: string, userId: string): Promise<void> {
    try {
      await apiClient.delete(`${DASHBOARD_API_URL}/widgets/${id}`, {
        params: { userId }
      });
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to remove widget');
    }
  }
}