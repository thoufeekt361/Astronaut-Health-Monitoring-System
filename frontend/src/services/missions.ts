import api from './api';
import { Mission } from '../types';

export const missionService = {
  getAll: async (): Promise<Mission[]> => {
    const response = await api.get('/missions');
    return response.data.data;
  },

  getById: async (id: string): Promise<Mission> => {
    const response = await api.get(`/missions/${id}`);
    return response.data.data;
  },

  create: async (data: Partial<Mission>): Promise<Mission> => {
    const response = await api.post('/missions', data);
    return response.data.data;
  },

  update: async (id: string, data: Partial<Mission>): Promise<Mission> => {
    const response = await api.put(`/missions/${id}`, data);
    return response.data.data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/missions/${id}`);
  },
};
