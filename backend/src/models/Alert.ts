import mongoose, { Document, Schema } from 'mongoose';

export type AlertSeverity = 'Critical' | 'Warning' | 'Informational';
export type AlertSource = 'Rule-Based' | 'ML-Anomaly';
export type AlertStatus = 'Active' | 'Acknowledged' | 'Resolved';

export interface IAlert extends Document {
  alertId: string;
  astronautId: string;
  missionId: string;
  title: string;
  description: string;
  severity: AlertSeverity;
  source: AlertSource;
  status: AlertStatus;
  createdAt: Date;
  acknowledgedAt?: Date | null;
  resolvedAt?: Date | null;
}

const AlertSchema = new Schema<IAlert>(
  {
    alertId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      index: true,
    },
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
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    severity: {
      type: String,
      enum: ['Critical', 'Warning', 'Informational'],
      default: 'Warning',
      index: true,
    },
    source: {
      type: String,
      enum: ['Rule-Based', 'ML-Anomaly'],
      default: 'Rule-Based',
    },
    status: {
      type: String,
      enum: ['Active', 'Acknowledged', 'Resolved'],
      default: 'Active',
      index: true,
    },
    acknowledgedAt: {
      type: Date,
      default: null,
    },
    resolvedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
);

AlertSchema.index({ status: 1, createdAt: -1 });

export const Alert = mongoose.model<IAlert>('Alert', AlertSchema);
