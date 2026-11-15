import api from './api';

export const analyticsService = {
  getDashboardAnalytics: async (): Promise<any> => {
    const response = await api.get('/analytics/dashboard');
    return response.data.data;
  },

  getAstronautAnalytics: async (): Promise<any> => {
    const response = await api.get('/analytics/astronauts');
    return response.data.data;
  },

  getMissionAnalytics: async (): Promise<any> => {
    const response = await api.get('/analytics/missions');
    return response.data.data;
  },

  getTrends: async (params?: { metric?: string; days?: number }): Promise<any> => {
    const response = await api.get('/analytics/trends', { params });
    return response.data.data;
  },
};
