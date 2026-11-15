import mongoose, { Document, Schema } from 'mongoose';

export interface IReport extends Document {
  reportId: string;
  reportType: 'Daily' | 'Weekly' | 'Mission' | 'Alerts';
  astronautId?: string;
  missionId?: string;
  fileUrl?: string;
  summaryText?: string;
  createdAt: Date;
}

const ReportSchema = new Schema<IReport>(
  {
    reportId: {
      type: String,
      required: true,
      unique: true,
    },
    reportType: {
      type: String,
      enum: ['Daily', 'Weekly', 'Mission', 'Alerts'],
      required: true,
    },
    astronautId: {
      type: String,
    },
    missionId: {
      type: String,
    },
    fileUrl: {
      type: String,
    },
    summaryText: {
      type: String,
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
);

export const Report = mongoose.model<IReport>('Report', ReportSchema);
