// src/models/Quiz.ts
import mongoose, { Schema, Document } from 'mongoose';

export interface IQuiz extends Document {
  title: string;
  description: string;
  channelId: mongoose.Types.ObjectId;
  createdBy: mongoose.Types.ObjectId;
  timeLimit: number;
  totalPoints: number;
  questions: mongoose.Types.ObjectId[];
  difficulty: 'easy' | 'medium' | 'hard' | 'adaptive';
  status: 'draft' | 'published' | 'archived';
  attemptsCount: number;
  averageScore: number;
  tags: string[];
  startDate?: Date;
  endDate?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const QuizSchema = new Schema<IQuiz>({
  title: {
    type: String,
    required: [true, 'Quiz title is required'],
    trim: true,
    maxlength: [200, 'Title cannot exceed 200 characters'],
  },
  description: {
    type: String,
    required: true,
    maxlength: [1000, 'Description cannot exceed 1000 characters'],
  },
  channelId: {
    type: Schema.Types.ObjectId,
    ref: 'Channel',
    required: true,
  },
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  timeLimit: {
    type: Number,
    required: true,
    default: 30,
    min: 1,
    max: 180,
  },
  totalPoints: {
    type: Number,
    default: 0,
  },
  questions: [{
    type: Schema.Types.ObjectId,
    ref: 'Question',
  }],
  difficulty: {
    type: String,
    enum: ['easy', 'medium', 'hard', 'adaptive'],
    default: 'medium',
  },
  status: {
    type: String,
    enum: ['draft', 'published', 'archived'],
    default: 'draft',
  },
  attemptsCount: {
    type: Number,
    default: 0,
  },
  averageScore: {
    type: Number,
    default: 0,
  },
  tags: [{
    type: String,
    trim: true,
  }],
  startDate: Date,
  endDate: Date,
}, {
  timestamps: true,
});

QuizSchema.index({ channelId: 1, status: 1 });
QuizSchema.index({ difficulty: 1 });
QuizSchema.index({ tags: 1 });

export default mongoose.models.Quiz || mongoose.model<IQuiz>('Quiz', QuizSchema);