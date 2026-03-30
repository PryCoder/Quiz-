// src/models/Attempt.ts
import mongoose, { Schema, Document } from 'mongoose';

export interface IAttempt extends Document {
  userId: mongoose.Types.ObjectId;
  quizId: mongoose.Types.ObjectId;
  channelId: mongoose.Types.ObjectId;
  score: number;
  totalPoints: number;
  percentage: number;
  answers: Array<{
    questionId: mongoose.Types.ObjectId;
    answer: string;
    isCorrect: boolean;
    timeSpent: number;
  }>;
  timeSpent: number;
  startedAt: Date;
  completedAt: Date;
  isCompleted: boolean;
  attempts: number;
  deviceInfo?: string;
  ipAddress?: string;
  createdAt: Date;
}

const AttemptSchema = new Schema<IAttempt>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  quizId: {
    type: Schema.Types.ObjectId,
    ref: 'Quiz',
    required: true,
  },
  channelId: {
    type: Schema.Types.ObjectId,
    ref: 'Channel',
    required: true,
  },
  score: {
    type: Number,
    default: 0,
  },
  totalPoints: {
    type: Number,
    required: true,
  },
  percentage: {
    type: Number,
    default: 0,
  },
  answers: [{
    questionId: {
      type: Schema.Types.ObjectId,
      ref: 'Question',
      required: true,
    },
    answer: {
      type: String,
      required: true,
    },
    isCorrect: {
      type: Boolean,
      required: true,
    },
    timeSpent: {
      type: Number,
      default: 0,
    },
  }],
  timeSpent: {
    type: Number,
    default: 0,
  },
  startedAt: {
    type: Date,
    default: Date.now,
  },
  completedAt: Date,
  isCompleted: {
    type: Boolean,
    default: false,
  },
  attempts: {
    type: Number,
    default: 1,
  },
  deviceInfo: String,
  ipAddress: String,
}, {
  timestamps: true,
});

AttemptSchema.index({ userId: 1, quizId: 1 });
AttemptSchema.index({ channelId: 1, percentage: -1 });
AttemptSchema.index({ createdAt: -1 });

export default mongoose.models.Attempt || mongoose.model<IAttempt>('Attempt', AttemptSchema);