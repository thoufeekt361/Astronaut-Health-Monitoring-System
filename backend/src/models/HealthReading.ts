import mongoose, { Document, Schema } from 'mongoose';

export type SensorStatus = 'Connected' | 'Degraded' | 'Disconnected';

export interface IHealthReading extends Document {
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
  source: string;
  timestamp: Date;
  createdAt: Date;
}

const HealthReadingSchema = new Schema<IHealthReading>(
  {
    astronautId: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    missionId: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    heartRate: {
      type: Number,
      required: true,
    },
    spo2: {
      type: Number,
      required: true,
    },
    temperature: {
      type: Number,
      required: true,
    },
    systolicBP: {
      type: Number,
      required: true,
    },
    diastolicBP: {
      type: Number,
      required: true,
    },
    respiratoryRate: {
      type: Number,
      required: true,
    },
    activityLevel: {
      type: Number,
      required: true,
      default: 1,
    },
    sensorStatus: {
      type: String,
      enum: ['Connected', 'Degraded', 'Disconnected'],
      default: 'Connected',
    },
    source: {
      type: String,
      default: 'BioHarness-Pro-MkIV',
    },
    timestamp: {
      type: Date,
      required: true,
      default: Date.now,
      index: true,
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
);

// High performance compound indexes for time-series lookups
HealthReadingSchema.index({ astronautId: 1, timestamp: -1 });
HealthReadingSchema.index({ missionId: 1, timestamp: -1 });

export const HealthReading = mongoose.model<IHealthReading>('HealthReading', HealthReadingSchema);
