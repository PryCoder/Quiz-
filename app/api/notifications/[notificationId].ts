// src/pages/api/notifications/[notificationId].ts
import { NextApiRequest, NextApiResponse } from 'next';
import dbConnect from '@/lib/db';
import{ Notification} from '@/models/Notification';
import { requireAuth } from '@/lib/auth';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await dbConnect();
  
  const { notificationId } = req.query;
  const user = (req as any).user;
  
  if (req.method === 'GET') {
    try {
      const notification = await Notification.findOne({
        _id: notificationId,
        userId: user.id,
      });
      
      if (!notification) {
        return res.status(404).json({ error: 'Notification not found' });
      }
      
      return res.status(200).json({ success: true, data: notification });
    } catch (error) {
      console.error('Get notification error:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }
  
  if (req.method === 'PUT') {
    try {
      const notification = await Notification.findOneAndUpdate(
        { _id: notificationId, userId: user.id },
        { $set: { read: true, readAt: new Date() } },
        { new: true }
      );
      
      if (!notification) {
        return res.status(404).json({ error: 'Notification not found' });
      }
      
      return res.status(200).json({ success: true, data: notification });
    } catch (error) {
      console.error('Mark notification as read error:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }
  
  if (req.method === 'DELETE') {
    try {
      const result = await Notification.findOneAndDelete({
        _id: notificationId,
        userId: user.id,
      });
      
      if (!result) {
        return res.status(404).json({ error: 'Notification not found' });
      }
      
      return res.status(200).json({ success: true, message: 'Notification deleted' });
    } catch (error) {
      console.error('Delete notification error:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }
  
  return res.status(405).json({ error: 'Method not allowed' });
}