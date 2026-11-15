import mongoose, { Document, Schema } from 'mongoose';

export type AstronautStatus = 'Healthy' | 'Warning' | 'Critical' | 'Off-duty';

export interface IAstronaut extends Document {
  astronautId: string;
  name: string;
  age: number;
  gender?: string;
  country: string;
  role: string;
  missionId: string;
  profileImage?: string;
  status: AstronautStatus;
  createdAt: Date;
  updatedAt: Date;
}

const AstronautSchema = new Schema<IAstronaut>(
  {
    astronautId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      index: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    age: {
      type: Number,
      required: true,
    },
    gender: {
      type: String,
      default: 'Unspecified',
    },
    country: {
      type: String,
      required: true,
      trim: true,
    },
    role: {
      type: String,
      required: true,
      trim: true,
    },
    missionId: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    profileImage: {
      type: String,
      default: '',
    },
    status: {
      type: String,
      enum: ['Healthy', 'Warning', 'Critical', 'Off-duty'],
      default: 'Healthy',
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

export const Astronaut = mongoose.model<IAstronaut>('Astronaut', AstronautSchema);
