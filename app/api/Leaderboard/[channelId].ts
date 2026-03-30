// src/pages/api/leaderboard/[channelId].ts
import { NextApiRequest, NextApiResponse } from 'next';
import dbConnect from '@/lib/db';
import { getChannelLeaderboard, getQuizLeaderboard } from '@/lib/leaderboard';
import { requireAuth } from '@/lib/auth';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  
  try {
    await dbConnect();
    
    const { channelId } = req.query;
    const { period = 'all', limit = 100, quizId } = req.query;
    
    let leaderboard;
    
    if (quizId) {
      leaderboard = await getQuizLeaderboard(quizId as string, Number(limit));
    } else {
      leaderboard = await getChannelLeaderboard(
        channelId as string,
        Number(limit),
        period as 'all' | 'monthly' | 'weekly'
      );
    }
    
    const userRank = leaderboard.findIndex(entry => entry.userId === (req as any).user?.id) + 1;
    
    return res.status(200).json({
      success: true,
      data: leaderboard,
      userRank: userRank || null,
      meta: {
        total: leaderboard.length,
        period,
        limit,
      },
    });
  } catch (error) {
    console.error('Leaderboard error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}