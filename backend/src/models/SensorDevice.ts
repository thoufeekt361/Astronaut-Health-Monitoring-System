import mongoose, { Document, Schema } from 'mongoose';

export interface ISensorDevice extends Document {
  sensorId: string;
  astronautId: string;
  sensorType: 'ECG' | 'PulseOximeter' | 'CoreTemp' | 'BloodPressure';
  connectionStatus: 'Connected' | 'Degraded' | 'Disconnected';
  lastUpdated: Date;
}

const SensorDeviceSchema = new Schema<ISensorDevice>({
  sensorId: {
    type: String,
    required: true,
    unique: true,
  },
  astronautId: {
    type: String,
    required: true,
    index: true,
  },
  sensorType: {
    type: String,
    enum: ['ECG', 'PulseOximeter', 'CoreTemp', 'BloodPressure'],
    required: true,
  },
  connectionStatus: {
    type: String,
    enum: ['Connected', 'Degraded', 'Disconnected'],
    default: 'Connected',
  },
  lastUpdated: {
    type: Date,
    default: Date.now,
  },
});

export const SensorDevice = mongoose.model<ISensorDevice>('SensorDevice', SensorDeviceSchema);
