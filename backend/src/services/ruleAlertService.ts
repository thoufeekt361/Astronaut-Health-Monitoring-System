import { Alert, IAlert } from '../models/Alert';
import { IHealthReading } from '../models/HealthReading';
import { getIO } from '../sockets/socketHandler';
import { v4 as uuidv4 } from 'uuid';

export interface SafetyThresholds {
  maxHeartRate: number;
  minHeartRate: number;
  minCriticalSpO2: number;
  minWarningSpO2: number;
  maxTemperature: number;
  minTemperature: number;
  maxSystolicBP: number;
  minSystolicBP: number;
  maxDiastolicBP: number;
  minDiastolicBP: number;
  maxRespiratoryRate: number;
  minRespiratoryRate: number;
}

// Configurable prototype safety limits for demonstration
export const DEFAULT_THRESHOLDS: SafetyThresholds = {
  maxHeartRate: 145,
  minHeartRate: 48,
  minCriticalSpO2: 90.0,
  minWarningSpO2: 94.0,
  maxTemperature: 38.3,
  minTemperature: 35.6,
  maxSystolicBP: 155,
  minSystolicBP: 88,
  maxDiastolicBP: 100,
  minDiastolicBP: 54,
  maxRespiratoryRate: 28,
  minRespiratoryRate: 9,
};

export const evaluateSafetyRules = async (
  reading: IHealthReading,
  thresholds: SafetyThresholds = DEFAULT_THRESHOLDS
): Promise<IAlert | null> => {
  let breachTitle = '';
  let breachDescription = '';
  let severity: 'Critical' | 'Warning' = 'Warning';

  // 1. SpO2 evaluation (Top criticality for EVA / cabin breach)
  if (reading.spo2 < thresholds.minCriticalSpO2) {
    severity = 'Critical';
    breachTitle = 'Severe Acute Hypoxia';
    breachDescription = `Blood oxygen saturation dropped critically to ${reading.spo2.toFixed(1)}% (Threshold: <${thresholds.minCriticalSpO2}%). Immediate O2 cabin supplement required.`;
  } else if (reading.spo2 < thresholds.minWarningSpO2) {
    severity = 'Warning';
    breachTitle = 'Hypoxia Warning';
    breachDescription = `Blood oxygen saturation depressed at ${reading.spo2.toFixed(1)}% (Threshold: <${thresholds.minWarningSpO2}%).`;
  }
  // 2. Heart rate evaluation
  else if (reading.heartRate > thresholds.maxHeartRate) {
    severity = reading.heartRate > 165 ? 'Critical' : 'Warning';
    breachTitle = severity === 'Critical' ? 'Critical Tachycardia Event' : 'Elevated Heart Rate Warning';
    breachDescription = `Heart rate recorded at ${Math.round(reading.heartRate)} BPM exceeding upper demonstration limit of ${thresholds.maxHeartRate} BPM.`;
  } else if (reading.heartRate < thresholds.minHeartRate) {
    severity = 'Warning';
    breachTitle = 'Acute Bradycardia Alert';
    breachDescription = `Heart rate dropped to ${Math.round(reading.heartRate)} BPM below safe lower threshold of ${thresholds.minHeartRate} BPM.`;
  }
  // 3. Core body temperature
  else if (reading.temperature > thresholds.maxTemperature) {
    severity = reading.temperature > 39.0 ? 'Critical' : 'Warning';
    breachTitle = 'Hyperthermia Alert';
    breachDescription = `Core body temperature reached ${reading.temperature.toFixed(1)}°C exceeding physiological baseline.`;
  } else if (reading.temperature < thresholds.minTemperature) {
    severity = 'Warning';
    breachTitle = 'Hypothermia Warning';
    breachDescription = `Core body temperature decreased to ${reading.temperature.toFixed(1)}°C. Check suit heating circuit.`;
  }
  // 4. Blood pressure
  else if (reading.systolicBP > thresholds.maxSystolicBP || reading.diastolicBP > thresholds.maxDiastolicBP) {
    severity = 'Warning';
    breachTitle = 'Hypertensive Excursion';
    breachDescription = `Blood pressure recorded at ${reading.systolicBP}/${reading.diastolicBP} mmHg exceeding safe operational envelope.`;
  }
  // 5. Respiration
  else if (reading.respiratoryRate > thresholds.maxRespiratoryRate) {
    severity = 'Warning';
    breachTitle = 'Tachypnea (Rapid Respiration)';
    breachDescription = `Respiratory frequency at ${reading.respiratoryRate} breaths/min exceeding normal range.`;
  }

  // If a safety rule was breached, persist and broadcast alert
  if (breachTitle) {
    // Throttle duplicate active alerts for same astronaut within 30 seconds
    const recentDuplicate = await Alert.findOne({
      astronautId: reading.astronautId,
      title: breachTitle,
      status: 'Active',
      createdAt: { $gt: new Date(Date.now() - 30000) },
    });

    if (recentDuplicate) {
      return null;
    }

    const alert = await Alert.create({
      alertId: `ALT-${Date.now().toString().slice(-6)}`,
      astronautId: reading.astronautId,
      missionId: reading.missionId,
      title: breachTitle,
      description: breachDescription,
      severity,
      source: 'Rule-Based',
      status: 'Active',
    });

    // Broadcast via Socket.IO
    const io = getIO();
    if (io) {
      io.emit('alert:new', alert);
    }

    return alert;
  }

  return null;
};
