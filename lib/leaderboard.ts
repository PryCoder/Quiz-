// src/lib/leaderboard.ts
import dbConnect from './db';
import Attempt from '@/models/Attempt';
import User from '@/models/User';
import Channel from '@/models/Channel';

export interface LeaderboardEntry {
  userId: string;
  name: string;
  avatar: string;
  score: number;
  quizzesCompleted: number;
  averagePercentage: number;
  streak: number;
}

export async function getChannelLeaderboard(
  channelId: string,
  limit: number = 100,
  period: 'all' | 'monthly' | 'weekly' = 'all'
): Promise<LeaderboardEntry[]> {
  await dbConnect();
  
  let dateFilter = {};
  const now = new Date();
  
  if (period === 'weekly') {
    dateFilter = { completedAt: { $gte: new Date(now.setDate(now.getDate() - 7)) } };
  } else if (period === 'monthly') {
    dateFilter = { completedAt: { $gte: new Date(now.setMonth(now.getMonth() - 1)) } };
  }
  
  const attempts = await Attempt.aggregate([
    {
      $match: {
        channelId: channelId,
        isCompleted: true,
        ...dateFilter,
      },
    },
    {
      $group: {
        _id: '$userId',
        totalScore: { $sum: '$score' },
        quizzesCompleted: { $sum: 1 },
        averagePercentage: { $avg: '$percentage' },
      },
    },
    {
      $sort: { totalScore: -1 },
    },
    {
      $limit: limit,
    },
  ]);
  
  const userIds = attempts.map(a => a._id);
  const users = await User.find({ _id: { $in: userIds } }).select('name avatar streak');
  
  const leaderboard = attempts.map(attempt => {
    const user = users.find(u => u._id.toString() === attempt._id.toString());
    return {
      userId: attempt._id,
      name: user?.name || 'Unknown',
      avatar: user?.avatar || '/images/default-avatar.png',
      score: attempt.totalScore,
      quizzesCompleted: attempt.quizzesCompleted,
      averagePercentage: Math.round(attempt.averagePercentage),
      streak: user?.streak || 0,
    };
  });
  
  return leaderboard;
}

export async function getQuizLeaderboard(
  quizId: string,
  limit: number = 50
): Promise<LeaderboardEntry[]> {
  await dbConnect();
  
  const attempts = await Attempt.find({
    quizId,
    isCompleted: true,
  })
    .sort({ score: -1, timeSpent: 1 })
    .limit(limit)
    .populate('userId', 'name avatar');
  
  return attempts.map(attempt => ({
    userId: attempt.userId._id,
    name: attempt.userId.name,
    avatar: attempt.userId.avatar,
    score: attempt.score,
    quizzesCompleted: 1,
    averagePercentage: attempt.percentage,
    streak: attempt.userId.streak,
  }));
}

export async function updateLeaderboardCache(channelId: string) {
  const leaderboard = await getChannelLeaderboard(channelId, 100);
  // Cache implementation would go here
  return leaderboard;
}