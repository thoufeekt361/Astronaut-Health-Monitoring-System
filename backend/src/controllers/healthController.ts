import { Request, Response } from 'express';
import { HealthReading } from '../models/HealthReading';
import { Astronaut } from '../models/Astronaut';
import { Mission } from '../models/Mission';
import { Alert } from '../models/Alert';
import { evaluateSafetyRules } from '../services/ruleAlertService';
import { analyzeWithML } from '../services/mlClientService';
import { getIO } from '../sockets/socketHandler';

export const ingestReading = async (req: Request, res: Response): Promise<void> => {
  try {
    const reading = await HealthReading.create(req.body);

    // Broadcast via Socket.IO
    const io = getIO();
    if (io) {
      io.emit('health:update', reading);
    }

    // 1. Evaluate safety bounds
    await evaluateSafetyRules(reading);

    // 2. Evaluate ML Isolation Forest asynchronously
    analyzeWithML(reading).catch(() => {});

    res.status(201).json({ success: true, data: reading });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const getReadings = async (req: Request, res: Response): Promise<void> => {
  try {
    const { astronautId, missionId, startDate, endDate, page = 1, limit = 20 } = req.query;

    const filter: any = {};
    if (astronautId && astronautId !== 'ALL') filter.astronautId = astronautId;
    if (missionId && missionId !== 'ALL') filter.missionId = missionId;

    if (startDate || endDate) {
      filter.timestamp = {};
      if (startDate) filter.timestamp.$gte = new Date(startDate as string);
      if (endDate) filter.timestamp.$lte = new Date(endDate as string);
    }

    const pageNum = parseInt(page as string, 10);
    const limitNum = parseInt(limit as string, 10);
    const skip = (pageNum - 1) * limitNum;

    const [readings, total] = await Promise.all([
      HealthReading.find(filter).sort({ timestamp: -1 }).skip(skip).limit(limitNum),
      HealthReading.countDocuments(filter),
    ]);

    res.json({
      success: true,
      data: readings,
      total,
      page: pageNum,
      pages: Math.ceil(total / limitNum),
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const getLatestReading = async (req: Request, res: Response): Promise<void> => {
  try {
    const { astronautId } = req.params;
    const reading = await HealthReading.findOne({ astronautId }).sort({ timestamp: -1 });

    if (!reading) {
      res.status(404).json({ success: false, message: `No telemetry found for ${astronautId}` });
      return;
    }
    res.json({ success: true, data: reading });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const getReadingHistory = async (req: Request, res: Response): Promise<void> => {
  try {
    const { astronautId } = req.params;
    const limit = parseInt((req.query.limit as string) || '50', 10);

    const history = await HealthReading.find({ astronautId })
      .sort({ timestamp: -1 })
      .limit(limit);

    // Return in chronological order for graphing
    res.json({ success: true, data: history.reverse() });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const getTelemetrySummary = async (req: Request, res: Response): Promise<void> => {
  try {
    const [totalAstronauts, activeMissions, healthyCount, attentionCount, criticalCount, activeAlerts] =
      await Promise.all([
        Astronaut.countDocuments(),
        Mission.countDocuments({ status: 'Active' }),
        Astronaut.countDocuments({ status: 'Healthy' }),
        Astronaut.countDocuments({ status: 'Warning' }),
        Astronaut.countDocuments({ status: 'Critical' }),
        Alert.countDocuments({ status: 'Active' }),
      ]);

    res.json({
      success: true,
      data: {
        totalAstronauts,
        activeMissions,
        healthyCount,
        attentionCount,
        criticalCount,
        activeAlerts,
        connectedSensors: totalAstronauts * 4,
        mlServiceStatus: 'online',
      },
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const getAstronautTrends = async (req: Request, res: Response): Promise<void> => {
  try {
    const { astronautId } = req.params;
    const readings = await HealthReading.find({ astronautId })
      .sort({ timestamp: -1 })
      .limit(60);

    if (readings.length === 0) {
      res.json({ success: true, data: { avgHR: 72, avgSpO2: 98.2, avgTemp: 36.8 } });
      return;
    }

    const avgHR = readings.reduce((acc, r) => acc + r.heartRate, 0) / readings.length;
    const avgSpO2 = readings.reduce((acc, r) => acc + r.spo2, 0) / readings.length;
    const avgTemp = readings.reduce((acc, r) => acc + r.temperature, 0) / readings.length;

    res.json({
      success: true,
      data: {
        astronautId,
        sampleCount: readings.length,
        avgHR: parseFloat(avgHR.toFixed(1)),
        avgSpO2: parseFloat(avgSpO2.toFixed(1)),
        avgTemp: parseFloat(avgTemp.toFixed(1)),
      },
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};
