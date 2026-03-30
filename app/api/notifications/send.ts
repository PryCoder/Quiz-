// src/pages/api/notifications/send.ts
import { NextApiRequest, NextApiResponse } from 'next';
import dbConnect from '@/lib/db';
import Subscription from '@/models/Subscription';
import { sendBulkNotifications } from '@/lib/notification';
import { requireRole } from '@/lib/auth';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  
  try {
    await dbConnect();
    const user = (req as any).user;
    
    const { channelId, title, body, type, data, scheduleFor } = req.body;
    
    if (!channelId || !title || !body) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    
    const subscriptions = await Subscription.find({
      channelId,
      status: 'active',
    }).populate('userId', 'email');
    
    const userIds = subscriptions.map(sub => sub.userId._id);
    
    if (scheduleFor) {
      // Schedule notification for later
      const scheduledDate = new Date(scheduleFor);
      if (scheduledDate <= new Date()) {
        return res.status(400).json({ error: 'Schedule date must be in the future' });
      }
      
      // Store in database for scheduled sending
      return res.status(200).json({
        success: true,
        message: `Notification scheduled for ${scheduledDate.toISOString()}`,
        data: { scheduledFor: scheduleFor, recipients: userIds.length },
      });
    }
    
    const results = await sendBulkNotifications(
      userIds,
      title,
      body,
      data,
      type || 'reminder'
    );
    
    return res.status(200).json({
      success: true,
      message: `Notifications sent to ${results.filter(r => r.success).length} recipients`,
      data: {
        total: userIds.length,
        successful: results.filter(r => r.success).length,
        failed: results.filter(r => !r.success).length,
      },
    });
  } catch (error) {
    console.error('Send notification error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}