// src/models/User.ts
import mongoose, { Schema, Document } from 'mongoose';
import bcrypt from 'bcryptjs';

export interface IUser extends Document {
  email: string;
  password: string;
  name: string;
  role: 'student' | 'teacher' | 'admin';
  avatar?: string;
  grade?: number;
  points: number;
  streak: number;
  badges: string[];
  subscriptionStatus: 'active' | 'inactive' | 'cancelled';
  lastLoginAt: Date;
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

const UserSchema = new Schema<IUser>({
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email'],
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters'],
    select: false,
  },
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
  },
  role: {
    type: String,
    enum: ['student', 'teacher', 'admin'],
    default: 'student',
  },
  avatar: {
    type: String,
    default: '/images/default-avatar.png',
  },
  grade: {
    type: Number,
    min: 5,
    max: 12,
  },
  points: {
    type: Number,
    default: 0,
  },
  streak: {
    type: Number,
    default: 0,
  },
  badges: [{
    type: String,
  }],
  subscriptionStatus: {
    type: String,
    enum: ['active', 'inactive', 'cancelled'],
    default: 'inactive',
  },
  lastLoginAt: {
    type: Date,
    default: Date.now,
  },
}, {
  timestamps: true,
});

UserSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error: any) {
    next(error);
  }
});

UserSchema.methods.comparePassword = async function(candidatePassword: string): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password);
};

UserSchema.index({ email: 1 });
UserSchema.index({ role: 1 });
UserSchema.index({ points: -1 });

export default mongoose.models.User || mongoose.model<IUser>('User', UserSchema);