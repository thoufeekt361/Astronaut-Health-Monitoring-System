export type UserRole = 'Admin' | 'Medical Officer' | 'Mission Operator';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  createdAt?: string;
}

export type AstronautStatus = 'Healthy' | 'Warning' | 'Critical' | 'Off-duty';

export interface Astronaut {
  _id?: string;
  astronautId: string;
  name: string;
  age: number;
  gender?: string;
  country: string;
  role: string;
  missionId: string;
  profileImage?: string;
  status: AstronautStatus;
  createdAt?: string;
  updatedAt?: string;
}

export type MissionStatus = 'Active' | 'Scheduled' | 'Completed' | 'Aborted';

export interface Mission {
  _id?: string;
  missionId: string;
  missionName: string;
  description: string;
  startDate: string;
  endDate: string;
  status: MissionStatus;
  astronautIds: string[];
  createdAt?: string;
  updatedAt?: string;
}

export type SensorStatus = 'Connected' | 'Degraded' | 'Disconnected';

export interface HealthReading {
  _id?: string;
  astronautId: string;
  missionId: string;
  heartRate: number;
  spo2: number;
  temperature: number;
  systolicBP: number;
  diastolicBP: number;
  respiratoryRate: number;
  activityLevel: number; // 0: resting, 1: normal, 2: active, 3: strenuous
  sensorStatus: SensorStatus;
  source?: string;
  timestamp: string;
}

export type AlertSeverity = 'Critical' | 'Warning' | 'Informational';
export type AlertSource = 'Rule-Based' | 'ML-Anomaly';
export type AlertStatus = 'Active' | 'Acknowledged' | 'Resolved';

export interface Alert {
  _id: string;
  alertId: string;
  astronautId: string;
  missionId: string;
  title: string;
  description: string;
  severity: AlertSeverity;
  source: AlertSource;
  status: AlertStatus;
  createdAt: string;
  acknowledgedAt?: string;
  resolvedAt?: string;
}

export interface Prediction {
  _id?: string;
  astronautId: string;
  missionId?: string;
  modelName: string;
  anomalyScore: number;
  isAnomaly: boolean;
  anomalyStatus: string;
  explanation: string;
  timestamp: string;
}

export interface SensorDevice {
  _id?: string;
  sensorId: string;
  astronautId: string;
  sensorType: 'ECG' | 'PulseOximeter' | 'CoreTemp' | 'BloodPressure';
  connectionStatus: SensorStatus;
  lastUpdated: string;
}

export interface TelemetrySummary {
  totalAstronauts: number;
  activeMissions: number;
  healthyCount: number;
  attentionCount: number;
  criticalCount: number;
  activeAlerts: number;
  connectedSensors: number;
  mlServiceStatus: 'online' | 'offline' | 'degraded';
}

export interface SimulatorStatus {
  isRunning: boolean;
  scenario: string;
  speed: number;
  activeAstronautId: string;
  intervalMs: number;
}
