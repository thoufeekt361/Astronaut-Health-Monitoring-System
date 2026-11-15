import axios from 'axios';
import { IHealthReading } from '../models/HealthReading';
import { Prediction, IPrediction } from '../models/Prediction';
import { Alert } from '../models/Alert';
import { getIO } from '../sockets/socketHandler';

const ML_SERVICE_URL = process.env.ML_SERVICE_URL || 'http://127.0.0.1:8000';

export interface MLPredictionResponse {
  astronautId: string;
  model: string;
  anomalyScore: number;
  isAnomaly: boolean;
  status: string;
  explanation: string;
  timestamp: string;
}

export const analyzeWithML = async (reading: IHealthReading): Promise<IPrediction | null> => {
  try {
    const payload = {
      astronautId: reading.astronautId,
      heartRate: reading.heartRate,
      spo2: reading.spo2,
      temperature: reading.temperature,
      systolicBP: reading.systolicBP,
      diastolicBP: reading.diastolicBP,
      respiratoryRate: reading.respiratoryRate,
      activityLevel: reading.activityLevel,
    };

    const response = await axios.post<MLPredictionResponse>(
      `${ML_SERVICE_URL}/predict`,
      payload,
      { timeout: 3000 }
    );

    const mlData = response.data;

    // Save prediction record
    const prediction = await Prediction.create({
      astronautId: mlData.astronautId,
      missionId: reading.missionId,
      modelName: mlData.model || 'IsolationForest-v1',
      anomalyScore: mlData.anomalyScore,
      isAnomaly: mlData.isAnomaly,
      anomalyStatus: mlData.status,
      explanation: mlData.explanation,
      timestamp: new Date(mlData.timestamp || Date.now()),
    });

    const io = getIO();
    if (io) {
      io.emit('ml:anomaly', prediction);
    }

    // If ML flagged an anomaly, create a corresponding safety alert
    if (mlData.isAnomaly) {
      const recentDup = await Alert.findOne({
        astronautId: reading.astronautId,
        source: 'ML-Anomaly',
        status: 'Active',
        createdAt: { $gt: new Date(Date.now() - 30000) },
      });

      if (!recentDup) {
        const mlAlert = await Alert.create({
          alertId: `ALT-ML-${Date.now().toString().slice(-6)}`,
          astronautId: reading.astronautId,
          missionId: reading.missionId,
          title: `Multivariate Anomaly Detected [Score: ${mlData.anomalyScore.toFixed(2)}]`,
          description: mlData.explanation || 'Unusual multi-feature vital sign combination detected by Isolation Forest.',
          severity: mlData.anomalyScore > 0.8 ? 'Critical' : 'Warning',
          source: 'ML-Anomaly',
          status: 'Active',
        });

        if (io) {
          io.emit('alert:new', mlAlert);
        }
      }
    }

    return prediction;
  } catch (err: any) {
    // Graceful degradation: The rule-based system continues regardless
    // console.warn(`[ML-Service] Python inference service unreachable (${err.message}). Continuing in rule-only safety mode.`);
    return null;
  }
};

export const getMLModelHealth = async (): Promise<any> => {
  try {
    const res = await axios.get(`${ML_SERVICE_URL}/model/status`, { timeout: 2000 });
    return res.data;
  } catch {
    return {
      status: 'DEGRADED',
      model: 'Isolation Forest (Offline)',
      message: 'FastAPI microservice currently unreachable. Ensure Python service is running on port 8000.',
    };
  }
};

export const triggerMLRetraining = async (): Promise<any> => {
  try {
    const res = await axios.post(`${ML_SERVICE_URL}/train`, {}, { timeout: 15000 });
    return res.data;
  } catch (err: any) {
    return {
      success: false,
      message: `Failed to trigger retraining: ${err.message}`,
    };
  }
};
