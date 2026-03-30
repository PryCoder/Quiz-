// src/models/Subscription.ts
import mongoose, { Schema, Document } from 'mongoose';

export interface ISubscription extends Document {
  userId: mongoose.Types.ObjectId;
  channelId: mongoose.Types.ObjectId;
  stripeSubscriptionId?: string;
  status: 'active' | 'expired' | 'cancelled' | 'pending';
  startDate: Date;
  endDate: Date;
  autoRenew: boolean;
  amount: number;
  paymentMethod: string;
  lastPaymentDate?: Date;
  nextPaymentDate?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const SubscriptionSchema = new Schema<ISubscription>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  channelId: {
    type: Schema.Types.ObjectId,
    ref: 'Channel',
    required: true,
  },
  stripeSubscriptionId: {
    type: String,
    sparse: true,
  },
  status: {
    type: String,
    enum: ['active', 'expired', 'cancelled', 'pending'],
    default: 'pending',
  },
  startDate: {
    type: Date,
    required: true,
  },
  endDate: {
    type: Date,
    required: true,
  },
  autoRenew: {
    type: Boolean,
    default: true,
  },
  amount: {
    type: Number,
    required: true,
  },
  paymentMethod: {
    type: String,
    required: true,
  },
  lastPaymentDate: Date,
  nextPaymentDate: Date,
}, {
  timestamps: true,
});

SubscriptionSchema.index({ userId: 1, channelId: 1 }, { unique: true });
SubscriptionSchema.index({ status: 1, endDate: 1 });
SubscriptionSchema.index({ stripeSubscriptionId: 1 });

export default mongoose.models.Subscription || mongoose.model<ISubscription>('Subscription', SubscriptionSchema);