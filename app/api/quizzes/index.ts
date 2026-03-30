// src/pages/api/quizzes/index.ts
import { NextApiRequest, NextApiResponse } from 'next';
import dbConnect from '@/lib/db';
import Quiz from '@/models/Quiz';
import { requireAuth } from '@/lib/auth';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await dbConnect();
  
  if (req.method === 'GET') {
    try {
      const user = (req as any).user;
      const { channelId, status, page = 1, limit = 20 } = req.query;
      
      const query: any = {};
      if (channelId) query.channelId = channelId;
      if (status) query.status = status;
      
      if (user.role === 'student') {
        query.status = 'published';
      }
      
      const quizzes = await Quiz.find(query)
        .populate('createdBy', 'name')
        .populate('channelId', 'name subject')
        .limit(Number(limit))
        .skip((Number(page) - 1) * Number(limit))
        .sort({ createdAt: -1 });
      
      const total = await Quiz.countDocuments(query);
      
      return res.status(200).json({
        success: true,
        data: quizzes,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          pages: Math.ceil(total / Number(limit)),
        },
      });
    } catch (error) {
      console.error('Get quizzes error:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }
  
  return res.status(405).json({ error: 'Method not allowed' });
}