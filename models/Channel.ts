// src/models/Channel.ts
import mongoose, { Schema, Document } from 'mongoose';

export interface IChannel extends Document {
  name: string;
  description: string;
  teacherId: mongoose.Types.ObjectId;
  subject: string;
  gradeLevel: number;
  price: number;
  isFree: boolean;
  subscriptionCount: number;
  tags: string[];
  coverImage?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const ChannelSchema = new Schema<IChannel>({
  name: {
    type: String,
    required: [true, 'Channel name is required'],
    trim: true,
    maxlength: [100, 'Channel name cannot exceed 100 characters'],
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
    maxlength: [1000, 'Description cannot exceed 1000 characters'],
  },
  teacherId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  subject: {
    type: String,
    required: true,
    trim: true,
  },
  gradeLevel: {
    type: Number,
    required: true,
    min: 5,
    max: 12,
  },
  price: {
    type: Number,
    default: 0,
    min: 0,
  },
  isFree: {
    type: Boolean,
    default: true,
  },
  subscriptionCount: {
    type: Number,
    default: 0,
  },
  tags: [{
    type: String,
    trim: true,
  }],
  coverImage: {
    type: String,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
}, {
  timestamps: true,
});

ChannelSchema.index({ teacherId: 1 });
ChannelSchema.index({ subject: 1, gradeLevel: 1 });
ChannelSchema.index({ isFree: 1, price: 1 });

export default mongoose.models.Channel || mongoose.model<IChannel>('Channel', ChannelSchema);