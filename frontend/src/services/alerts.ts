import api from './api';
import { Alert } from '../types';

export const alertService = {
  getAll: async (params?: {
    severity?: string;
    status?: string;
    astronautId?: string;
    limit?: number;
  }): Promise<Alert[]> => {
    const response = await api.get('/alerts', { params });
    return response.data.data;
  },

  getSummary: async (): Promise<{ critical: number; warning: number; informational: number; total: number }> => {
    const response = await api.get('/alerts/summary');
    return response.data.data;
  },

  acknowledge: async (alertId: string): Promise<Alert> => {
    const response = await api.patch(`/alerts/${alertId}/acknowledge`);
    return response.data.data;
  },

  resolve: async (alertId: string): Promise<Alert> => {
    const response = await api.patch(`/alerts/${alertId}/resolve`);
    return response.data.data;
  },

  create: async (alert: Partial<Alert>): Promise<Alert> => {
    const response = await api.post('/alerts', alert);
    return response.data.data;
  },
};
