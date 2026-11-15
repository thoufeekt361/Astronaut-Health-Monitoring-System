import { Request, Response } from 'express';
import { Prediction } from '../models/Prediction';
import { getMLModelHealth, triggerMLRetraining, analyzeWithML } from '../services/mlClientService';

export const getPredictions = async (req: Request, res: Response): Promise<void> => {
  try {
    const limit = parseInt((req.query.limit as string) || '30', 10);
    const predictions = await Prediction.find()
      .sort({ timestamp: -1 })
      .limit(limit);

    res.json({ success: true, data: predictions });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const getModelStatus = async (req: Request, res: Response): Promise<void> => {
  try {
    const status = await getMLModelHealth();
    res.json({ success: true, data: status });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const retrainModel = async (req: Request, res: Response): Promise<void> => {
  try {
    const result = await triggerMLRetraining();
    res.json({ success: true, data: result });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const analyzeReadingDirect = async (req: Request, res: Response): Promise<void> => {
  try {
    const prediction = await analyzeWithML(req.body);
    res.json({ success: true, data: prediction });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};
