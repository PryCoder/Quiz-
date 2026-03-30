import mongoose, { Schema, Document, Model } from 'mongoose';

export interface INotification extends Document {
  userId: mongoose.Types.ObjectId;
  channelId?: mongoose.Types.ObjectId;
  title: string;
  message: string;
  type: 'quiz' | 'subscription' | 'reminder' | 'achievement' | 'system';
  isRead: boolean;
  data?: any;
  scheduledFor?: Date;
  sentAt?: Date;
  createdAt: Date;
}

const NotificationSchema = new Schema<INotification>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  channelId: {
    type: Schema.Types.ObjectId,
    ref: 'Channel',
  },
  title: {
    type: String,
    required: true,
  },
  message: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    enum: ['quiz', 'subscription', 'reminder', 'achievement', 'system'],
    required: true,
  },
  isRead: {
    type: Boolean,
    default: false,
  },
  data: Schema.Types.Mixed,
  scheduledFor: Date,
  sentAt: Date,
}, {
  timestamps: true,
});

// Create indexes
NotificationSchema.index({ userId: 1, isRead: 1 });
NotificationSchema.index({ scheduledFor: 1 });

export const Notification: Model<INotification> = mongoose.models.Notification || mongoose.model<INotification>('Notification', NotificationSchema);