import api from './api';
import { Prediction } from '../types';

export const mlService = {
  getPredictions: async (limit = 30): Promise<Prediction[]> => {
    const response = await api.get('/ml/predictions', { params: { limit } });
    return response.data.data;
  },

  getModelStatus: async (): Promise<any> => {
    const response = await api.get('/ml/model-status');
    return response.data.data;
  },

  retrainModel: async (): Promise<any> => {
    const response = await api.post('/ml/retrain');
    return response.data;
  },

  analyzeTelemetry: async (reading: any): Promise<Prediction> => {
    const response = await api.post('/ml/analyze', reading);
    return response.data.data;
  },
};
