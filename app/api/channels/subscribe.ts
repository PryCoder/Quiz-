// src/pages/api/channels/subscribe.ts
import { NextApiRequest, NextApiResponse } from 'next';
import dbConnect from '@/lib/db';
import Channel from '@/models/Channel';
import Subscription from '@/models/Subscription';
import { createSubscription } from '@/lib/subscription';
import { requireAuth } from '@/lib/auth';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  
  try {
    await dbConnect();
    const user = (req as any).user;
    
    const { channelId, paymentMethodId } = req.body;
    
    if (!channelId) {
      return res.status(400).json({ error: 'Channel ID is required' });
    }
    
    const channel = await Channel.findById(channelId);
    if (!channel) {
      return res.status(404).json({ error: 'Channel not found' });
    }
    
    const existingSubscription = await Subscription.findOne({
      userId: user.id,
      channelId,
      status: 'active',
    });
    
    if (existingSubscription) {
      return res.status(400).json({ error: 'Already subscribed to this channel' });
    }
    
    const subscription = await createSubscription(
      user.id,
      channelId,
      paymentMethodId
    );
    
    channel.subscriptionCount += 1;
    await channel.save();
    
    return res.status(200).json({
      success: true,
      message: 'Subscribed successfully',
      data: subscription,
    });
  } catch (error: any) {
    console.error('Subscribe error:', error);
    return res.status(500).json({ error: error.message || 'Internal server error' });
  }
}