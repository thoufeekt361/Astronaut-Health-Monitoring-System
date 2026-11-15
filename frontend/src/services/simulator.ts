import api from './api';
import { SimulatorStatus } from '../types';

export const simulatorService = {
  getStatus: async (): Promise<SimulatorStatus> => {
    const response = await api.get('/simulator/status');
    return response.data.data;
  },

  start: async (params?: { speed?: number; scenario?: string }): Promise<SimulatorStatus> => {
    const response = await api.post('/simulator/start', params);
    return response.data.data;
  },

  stop: async (): Promise<SimulatorStatus> => {
    const response = await api.post('/simulator/stop');
    return response.data.data;
  },

  setScenario: async (scenario: string, astronautId?: string): Promise<any> => {
    const response = await api.post('/simulator/scenario', { scenario, astronautId });
    return response.data;
  },
};
