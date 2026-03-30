// src/pages/api/payments/create-subscription.ts
import { NextApiRequest, NextApiResponse } from 'next';
import Stripe from 'stripe';
import dbConnect from '@/lib/db';
import Channel from '@/models/Channel';
import { createSubscription } from '@/lib/subscription';
import { requireAuth } from '@/lib/auth';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
});

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
    
    if (channel.isFree) {
      return res.status(400).json({ error: 'This channel is free' });
    }
    
    const subscription = await createSubscription(
      user.id,
      channelId,
      paymentMethodId
    );
    
    return res.status(200).json({
      success: true,
      data: {
        subscriptionId: subscription.subscriptionId,
        clientSecret: subscription.clientSecret,
      },
    });
  } catch (error: any) {
    console.error('Create subscription error:', error);
    return res.status(500).json({ error: error.message || 'Internal server error' });
  }
}