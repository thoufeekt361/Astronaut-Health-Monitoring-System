import api from './api';
import { Astronaut } from '../types';

export const astronautService = {
  getAll: async (params?: { missionId?: string; status?: string }): Promise<Astronaut[]> => {
    const response = await api.get('/astronauts', { params });
    return response.data.data;
  },

  getById: async (id: string): Promise<Astronaut> => {
    const response = await api.get(`/astronauts/${id}`);
    return response.data.data;
  },

  create: async (data: Partial<Astronaut>): Promise<Astronaut> => {
    const response = await api.post('/astronauts', data);
    return response.data.data;
  },

  update: async (id: string, data: Partial<Astronaut>): Promise<Astronaut> => {
    const response = await api.put(`/astronauts/${id}`, data);
    return response.data.data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/astronauts/${id}`);
  },
};
