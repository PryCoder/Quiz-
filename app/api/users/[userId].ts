// src/pages/api/users/[userId].ts
import { NextApiRequest, NextApiResponse } from 'next';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import Subscription from '@/models/Subscription';
import Attempt from '@/models/Attempt';
import { requireAuth } from '@/lib/auth';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await dbConnect();
  
  const { userId } = req.query;
  
  if (req.method === 'GET') {
    try {
      const user = await User.findById(userId).select('-password');
      
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }
      
      const subscriptions = await Subscription.find({ userId })
        .populate('channelId', 'name subject gradeLevel');
      
      const recentAttempts = await Attempt.find({ userId })
        .populate('quizId', 'title')
        .sort({ createdAt: -1 })
        .limit(10);
      
      const stats = {
        totalQuizzesTaken: await Attempt.countDocuments({ userId, isCompleted: true }),
        averageScore: await Attempt.aggregate([
          { $match: { userId, isCompleted: true } },
          { $group: { _id: null, avg: { $avg: '$percentage' } } },
        ]),
        totalPoints: user.points,
        currentStreak: user.streak,
        badges: user.badges,
      };
      
      return res.status(200).json({
        success: true,
        data: {
          user,
          subscriptions,
          recentAttempts,
          stats,
        },
      });
    } catch (error) {
      console.error('Get user error:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }
  
  if (req.method === 'DELETE') {
    try {
      const user = await User.findByIdAndDelete(userId);
      
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }
      
      await Subscription.deleteMany({ userId });
      await Attempt.deleteMany({ userId });
      
      return res.status(200).json({ success: true, message: 'User deleted successfully' });
    } catch (error) {
      console.error('Delete user error:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }
  
  return res.status(405).json({ error: 'Method not allowed' });
}