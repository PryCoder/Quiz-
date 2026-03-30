// src/pages/api/channels/[channelId].ts
import { NextApiRequest, NextApiResponse } from 'next';
import dbConnect from '@/lib/db';
import Channel from '@/models/Channel';
import Quiz from '@/models/Quiz';
import Subscription from '@/models/Subscription';
import { requireAuth } from '@/lib/auth';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await dbConnect();
  
  const { channelId } = req.query;
  
  if (req.method === 'GET') {
    try {
      const channel = await Channel.findById(channelId)
        .populate('teacherId', 'name email avatar');
      
      if (!channel) {
        return res.status(404).json({ error: 'Channel not found' });
      }
      
      const quizzes = await Quiz.find({ channelId, status: 'published' })
        .sort({ createdAt: -1 })
        .limit(10);
      
      const subscriptionCount = await Subscription.countDocuments({
        channelId,
        status: 'active',
      });
      
      return res.status(200).json({
        success: true,
        data: {
          ...channel.toObject(),
          quizzes,
          activeSubscribers: subscriptionCount,
        },
      });
    } catch (error) {
      console.error('Get channel error:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }
  
  if (req.method === 'PUT') {
    try {
      const user = (req as any).user;
      const updates = req.body;
      
      const channel = await Channel.findOne({ _id: channelId, teacherId: user.id });
      if (!channel && user.role !== 'admin') {
        return res.status(403).json({ error: 'Not authorized to update this channel' });
      }
      
      const updatedChannel = await Channel.findByIdAndUpdate(
        channelId,
        { $set: updates },
        { new: true, runValidators: true }
      );
      
      if (!updatedChannel) {
        return res.status(404).json({ error: 'Channel not found' });
      }
      
      return res.status(200).json({ success: true, data: updatedChannel });
    } catch (error) {
      console.error('Update channel error:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }
  
  if (req.method === 'DELETE') {
    try {
      const user = (req as any).user;
      
      const channel = await Channel.findOne({ _id: channelId, teacherId: user.id });
      if (!channel && user.role !== 'admin') {
        return res.status(403).json({ error: 'Not authorized to delete this channel' });
      }
      
      await Channel.findByIdAndDelete(channelId);
      await Quiz.deleteMany({ channelId });
      await Subscription.deleteMany({ channelId });
      
      return res.status(200).json({ success: true, message: 'Channel deleted successfully' });
    } catch (error) {
      console.error('Delete channel error:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }
  
  return res.status(405).json({ error: 'Method not allowed' });
}