import api from './api';
import { HealthReading, TelemetrySummary } from '../types';

export const healthService = {
  getLatest: async (astronautId: string): Promise<HealthReading> => {
    const response = await api.get(`/health/latest/${astronautId}`);
    return response.data.data;
  },

  getHistory: async (astronautId: string, limit = 50): Promise<HealthReading[]> => {
    const response = await api.get(`/health/history/${astronautId}`, {
      params: { limit },
    });
    return response.data.data;
  },

  getAllReadings: async (params?: {
    astronautId?: string;
    missionId?: string;
    startDate?: string;
    endDate?: string;
    page?: number;
    limit?: number;
  }): Promise<{ data: HealthReading[]; total: number; pages: number }> => {
    const response = await api.get('/health/readings', { params });
    return response.data;
  },

  getSummary: async (): Promise<TelemetrySummary> => {
    const response = await api.get('/health/summary');
    return response.data.data;
  },

  getTrends: async (astronautId: string): Promise<any> => {
    const response = await api.get(`/health/trends/${astronautId}`);
    return response.data.data;
  },

  submitReading: async (reading: Partial<HealthReading>): Promise<HealthReading> => {
    const response = await api.post('/health/readings', reading);
    return response.data.data;
  },
};
