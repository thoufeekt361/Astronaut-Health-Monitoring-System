import api from './api';
import { User } from '../types';

export interface LoginResponse {
  success: boolean;
  token: string;
  user: User;
  message?: string;
}

export const authService = {
  login: async (email: string, password: string): Promise<LoginResponse> => {
    const response = await api.post('/auth/login', { email, password });
    return response.data;
  },

  register: async (name: string, email: string, password: string, role: string): Promise<LoginResponse> => {
    const response = await api.post('/auth/register', { name, email, password, role });
    return response.data;
  },

  getMe: async (): Promise<{ success: boolean; user: User }> => {
    const response = await api.get('/auth/me');
    return response.data;
  },

  logout: async (): Promise<void> => {
    try {
      await api.post('/auth/logout');
    } catch {
      // Ignore network errors on logout
    } finally {
      localStorage.removeItem('cosmic_token');
      localStorage.removeItem('cosmic_user');
    }
  },
};
