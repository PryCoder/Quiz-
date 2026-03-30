// src/pages/api/notifications/subscribe.ts
import { NextApiRequest, NextApiResponse } from 'next';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import { requireAuth } from '@/lib/auth';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  
  try {
    await dbConnect();
    const user = (req as any).user;
    
    const { subscription } = req.body;
    
    if (!subscription) {
      return res.status(400).json({ error: 'Push subscription is required' });
    }
    
    const dbUser = await User.findById(user.id);
    if (!dbUser) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    if (!dbUser.pushSubscriptions) {
      dbUser.pushSubscriptions = [];
    }
    
    const existingSubscription = dbUser.pushSubscriptions.find(
      sub => sub.endpoint === subscription.endpoint
    );
    
    if (!existingSubscription) {
      dbUser.pushSubscriptions.push(subscription);
      await dbUser.save();
    }
    
    return res.status(200).json({
      success: true,
      message: 'Subscribed to push notifications',
    });
  } catch (error) {
    console.error('Subscribe to notifications error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}