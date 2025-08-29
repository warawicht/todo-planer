import axios from 'axios';
import { 
  LoginRequest, 
  RegisterRequest, 
  ForgotPasswordRequest, 
  ResetPasswordRequest,
  User 
} from '../types/auth.types';

// Configure axios base URL (adjust according to your backend URL)
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000';
const AUTH_API_URL = `${API_BASE_URL}/auth`;

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

// Add a response interceptor to handle token refresh
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    // If error is 401 and we haven't tried to refresh token yet
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        // Try to refresh the token
        const refreshTokenResponse = await AuthService.refreshToken();
        const newToken = refreshTokenResponse.accessToken;
        
        // Save new token
        localStorage.setItem('accessToken', newToken);
        
        // Retry original request with new token
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return apiClient(originalRequest);
      } catch (refreshError) {
        // If refresh fails, redirect to login
        localStorage.removeItem('accessToken');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }
    
    return Promise.reject(error);
  }
);

export class AuthService {
  // User registration
  static async register(data: RegisterRequest): Promise<{ success: boolean; message: string; user?: User }> {
    try {
      const response = await apiClient.post(`${AUTH_API_URL}/register`, data);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Registration failed');
    }
  }

  // User login
  static async login(data: LoginRequest): Promise<{ success: boolean; accessToken: string; refreshToken: string; user: { email: string } }> {
    try {
      const response = await apiClient.post(`${AUTH_API_URL}/login`, data);
      const { accessToken, refreshToken, user } = response.data;
      
      // Save tokens to localStorage
      localStorage.setItem('accessToken', accessToken);
      // Refresh token is stored in http-only cookie by backend
      
      return { success: true, accessToken, refreshToken, user };
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Login failed');
    }
  }

  // Logout
  static async logout(): Promise<{ success: boolean; message: string }> {
    try {
      // Get refresh token from localStorage or cookie
      const refreshToken = localStorage.getItem('refreshToken');
      
      const response = await apiClient.post(`${AUTH_API_URL}/logout`, { refreshToken });
      
      // Clear tokens from localStorage
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      
      return response.data;
    } catch (error: any) {
      // Even if logout fails on server, clear local tokens
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      throw new Error(error.response?.data?.message || 'Logout failed');
    }
  }

  // Refresh access token
  static async refreshToken(): Promise<{ success: boolean; accessToken: string }> {
    try {
      const response = await apiClient.post(`${AUTH_API_URL}/refresh`);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Token refresh failed');
    }
  }

  // Forgot password
  static async forgotPassword(data: ForgotPasswordRequest): Promise<{ success: boolean; message: string }> {
    try {
      const response = await apiClient.post(`${AUTH_API_URL}/forgot-password`, data);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to send password reset email');
    }
  }

  // Reset password
  static async resetPassword(data: ResetPasswordRequest): Promise<{ success: boolean; message: string }> {
    try {
      const response = await apiClient.post(`${AUTH_API_URL}/reset-password`, data);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to reset password');
    }
  }

  // Get user profile
  static async getProfile(): Promise<{ success: boolean; user: User }> {
    try {
      const response = await apiClient.get(`${AUTH_API_URL}/profile`);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch profile');
    }
  }

  // Update user profile
  static async updateProfile(data: Partial<User>): Promise<{ success: boolean; message: string; user: User }> {
    try {
      const response = await apiClient.put(`${AUTH_API_URL}/profile`, data);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to update profile');
    }
  }

  // Check if user is authenticated
  static isAuthenticated(): boolean {
    const token = localStorage.getItem('accessToken');
    return !!token;
  }

  // Get current user token
  static getCurrentToken(): string | null {
    return localStorage.getItem('accessToken');
  }
}