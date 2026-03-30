// src/lib/notifications.ts
import webpush from 'web-push';
import dbConnect from './db';
import {Notification } from '@/models/Notification';
import User from '@/models/User';

webpush.setVapidDetails(
  'mailto:admin@ai-quiz.com',
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
  process.env.VAPID_PRIVATE_KEY!
);

export async function sendNotification(
  userId: string,
  title: string,
  body: string,
  data?: any,
  type: 'quiz' | 'subscription' | 'reminder' | 'achievement' = 'reminder'
) {
  await dbConnect();
  
  const user = await User.findById(userId);
  if (!user || !user.subscriptionStatus) {
    return;
  }
  
  const notification = await Notification.create({
    userId,
    title,
    body,
    type,
    data,
    status: 'pending',
    scheduledFor: new Date(),
  });
  
  if (user.subscriptionStatus === 'active') {
    await pushNotification(userId, notification);
  }
  
  return notification;
}

export async function sendBulkNotifications(
  userIds: string[],
  title: string,
  body: string,
  data?: any,
  type: 'quiz' | 'subscription' | 'reminder' | 'achievement' = 'reminder'
) {
  const results = [];
  
  for (const userId of userIds) {
    try {
      const notification = await sendNotification(userId, title, body, data, type);
      results.push({ userId, success: true, notification });
    } catch (error) {
      results.push({ userId, success: false, error });
    }
  }
  
  return results;
}

async function pushNotification(userId: string, notification: any) {
  const subscriptions = await getPushSubscriptions(userId);
  
  const payload = JSON.stringify({
    title: notification.title,
    body: notification.body,
    data: notification.data,
    icon: '/images/logo.png',
    badge: '/images/badge.png',
  });
  
  const promises = subscriptions.map(async (subscription) => {
    try {
      await webpush.sendNotification(subscription, payload);
      notification.status = 'sent';
      notification.sentAt = new Date();
      await notification.save();
    } catch (error) {
      console.error('Push notification error:', error);
      if (error.statusCode === 410) {
        await removeSubscription(subscription);
      }
    }
  });
  
  await Promise.allSettled(promises);
}

async function getPushSubscriptions(userId: string) {
  const user = await User.findById(userId);
  return user?.pushSubscriptions || [];
}

async function removeSubscription(subscription: any) {
  await User.updateOne(
    { pushSubscriptions: subscription },
    { $pull: { pushSubscriptions: subscription } }
  );
}

export async function scheduleNotification(
  userId: string,
  title: string,
  body: string,
  scheduledFor: Date,
  data?: any
) {
  await dbConnect();
  
  return Notification.create({
    userId,
    title,
    body,
    type: 'reminder',
    data,
    status: 'scheduled',
    scheduledFor,
  });
}

export async function processScheduledNotifications() {
  await dbConnect();
  
  const now = new Date();
  const notifications = await Notification.find({
    status: 'scheduled',
    scheduledFor: { $lte: now },
  });
  
  for (const notification of notifications) {
    notification.status = 'pending';
    await notification.save();
    await sendNotification(
      notification.userId,
      notification.title,
      notification.body,
      notification.data,
      notification.type
    );
  }
}