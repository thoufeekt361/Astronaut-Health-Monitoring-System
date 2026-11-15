import mongoose, { Document, Schema } from 'mongoose';

export interface IPrediction extends Document {
  astronautId: string;
  missionId?: string;
  modelName: string;
  anomalyScore: number;
  isAnomaly: boolean;
  anomalyStatus: string;
  explanation: string;
  timestamp: Date;
  createdAt: Date;
}

const PredictionSchema = new Schema<IPrediction>(
  {
    astronautId: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    missionId: {
      type: String,
      trim: true,
    },
    modelName: {
      type: String,
      default: 'IsolationForest-v1',
    },
    anomalyScore: {
      type: Number,
      required: true,
    },
    isAnomaly: {
      type: Boolean,
      default: false,
    },
    anomalyStatus: {
      type: String,
      default: 'Nominal baseline',
    },
    explanation: {
      type: String,
      default: '',
    },
    timestamp: {
      type: Date,
      default: Date.now,
      index: true,
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
);

PredictionSchema.index({ astronautId: 1, timestamp: -1 });

export const Prediction = mongoose.model<IPrediction>('Prediction', PredictionSchema);
