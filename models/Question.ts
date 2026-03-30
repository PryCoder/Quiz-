// src/models/Question.ts
import mongoose, { Schema, Document } from 'mongoose';

export interface IQuestion extends Document {
  quizId: mongoose.Types.ObjectId;
  text: string;
  type: 'mcq' | 'true-false' | 'nat';
  options?: string[];
  correctAnswer: string;
  explanation?: string;
  difficulty: 'easy' | 'medium' | 'hard';
  points: number;
  hint?: string;
  isAIGenerated: boolean;
  isApproved: boolean;
  tags: string[];
  metadata: {
    topic: string;
    subtopic?: string;
    gradeLevel: number;
  };
  createdAt: Date;
  updatedAt: Date;
}

const QuestionSchema = new Schema<IQuestion>({
  quizId: {
    type: Schema.Types.ObjectId,
    ref: 'Quiz',
    required: true,
  },
  text: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    enum: ['mcq', 'true-false', 'nat'],
    required: true,
  },
  options: [{
    type: String,
  }],
  correctAnswer: {
    type: String,
    required: true,
  },
  explanation: String,
  difficulty: {
    type: String,
    enum: ['easy', 'medium', 'hard'],
    required: true,
  },
  points: {
    type: Number,
    required: true,
    default: 10,
  },
  hint: String,
  isAIGenerated: {
    type: Boolean,
    default: false,
  },
  isApproved: {
    type: Boolean,
    default: false,
  },
  tags: [String],
  metadata: {
    topic: {
      type: String,
      required: true,
    },
    subtopic: String,
    gradeLevel: {
      type: Number,
      required: true,
      min: 5,
      max: 12,
    },
  },
}, {
  timestamps: true,
});

QuestionSchema.index({ quizId: 1 });
QuestionSchema.index({ metadata: 1 });
QuestionSchema.index({ isApproved: 1 });

export default mongoose.models.Question || mongoose.model<IQuestion>('Question', QuestionSchema);