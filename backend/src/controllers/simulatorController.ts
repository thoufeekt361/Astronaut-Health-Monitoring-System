import { Request, Response } from 'express';
import {
  getSimulatorStatus,
  startSimulator,
  stopSimulator,
  setScenario,
} from '../services/simulatorService';

export const getStatus = async (req: Request, res: Response): Promise<void> => {
  res.json({ success: true, data: getSimulatorStatus() });
};

export const start = async (req: Request, res: Response): Promise<void> => {
  const status = startSimulator(req.body);
  res.json({ success: true, message: 'Telemetry generator activated', data: status });
};

export const stop = async (req: Request, res: Response): Promise<void> => {
  const status = stopSimulator();
  res.json({ success: true, message: 'Telemetry generator paused', data: status });
};

export const switchScenario = async (req: Request, res: Response): Promise<void> => {
  const { scenario, astronautId } = req.body;
  const status = setScenario(scenario, astronautId);
  res.json({ success: true, message: `Scenario switched to ${scenario}`, data: status });
};
