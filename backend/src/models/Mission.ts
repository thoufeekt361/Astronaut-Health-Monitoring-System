import mongoose, { Document, Schema } from 'mongoose';

export type MissionStatus = 'Active' | 'Scheduled' | 'Completed' | 'Aborted';

export interface IMission extends Document {
  missionId: string;
  missionName: string;
  description: string;
  startDate: Date;
  endDate: Date;
  status: MissionStatus;
  astronautIds: string[];
  createdAt: Date;
  updatedAt: Date;
}

const MissionSchema = new Schema<IMission>(
  {
    missionId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      index: true,
    },
    missionName: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      default: '',
    },
    startDate: {
      type: Date,
      required: true,
    },
    endDate: {
      type: Date,
      required: true,
    },
    status: {
      type: String,
      enum: ['Active', 'Scheduled', 'Completed', 'Aborted'],
      default: 'Active',
      index: true,
    },
    astronautIds: [
      {
        type: String,
        trim: true,
      },
    ],
  },
  {
    timestamps: true,
  }
);

export const Mission = mongoose.model<IMission>('Mission', MissionSchema);
