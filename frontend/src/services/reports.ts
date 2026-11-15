import api from './api';

export const reportService = {
  getHealthReport: async (params?: { astronautId?: string; missionId?: string }): Promise<any> => {
    const response = await api.get('/reports/health', { params });
    return response.data.data;
  },

  getAlertsReport: async (): Promise<any> => {
    const response = await api.get('/reports/alerts');
    return response.data.data;
  },

  getMissionReport: async (missionId?: string): Promise<any> => {
    const response = await api.get('/reports/mission', { params: { missionId } });
    return response.data.data;
  },

  exportCsvUrl: (astronautId?: string, missionId?: string): string => {
    let url = `${api.defaults.baseURL}/reports/export/csv`;
    const params = new URLSearchParams();
    if (astronautId) params.append('astronautId', astronautId);
    if (missionId) params.append('missionId', missionId);
    if (params.toString()) {
      url += `?${params.toString()}`;
    }
    return url;
  },

  exportPdfUrl: (astronautId?: string, missionId?: string): string => {
    let url = `${api.defaults.baseURL}/reports/export/pdf`;
    const params = new URLSearchParams();
    if (astronautId) params.append('astronautId', astronautId);
    if (missionId) params.append('missionId', missionId);
    if (params.toString()) {
      url += `?${params.toString()}`;
    }
    return url;
  },
};
