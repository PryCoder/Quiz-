// src/pages/api/channels/index.ts
import { NextApiRequest, NextApiResponse } from 'next';
import dbConnect from '@/lib/db';
import Channel from '@/models/Channel';
import { requireAuth, requireRole } from '@/lib/auth';

async function handler(req: NextApiRequest, res: NextApiResponse) {
  await dbConnect();
  
  if (req.method === 'GET') {
    try {
      const { subject, gradeLevel, isFree, search, page = 1, limit = 20 } = req.query;
      
      const query: any = { isActive: true };
      if (subject) query.subject = subject;
      if (gradeLevel) query.gradeLevel = Number(gradeLevel);
      if (isFree !== undefined) query.isFree = isFree === 'true';
      if (search) {
        query.$or = [
          { name: { $regex: search, $options: 'i' } },
          { description: { $regex: search, $options: 'i' } },
        ];
      }
      
      const channels = await Channel.find(query)
        .populate('teacherId', 'name email')
        .limit(Number(limit))
        .skip((Number(page) - 1) * Number(limit))
        .sort({ subscriptionCount: -1, createdAt: -1 });
      
      const total = await Channel.countDocuments(query);
      
      return res.status(200).json({
        success: true,
        data: channels,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          pages: Math.ceil(total / Number(limit)),
        },
      });
    } catch (error) {
      console.error('Get channels error:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }
  
  if (req.method === 'POST') {
    try {
      const user = (req as any).user;
      const { name, description, subject, gradeLevel, price, tags, coverImage } = req.body;
      
      const channel = await Channel.create({
        name,
        description,
        teacherId: user.id,
        subject,
        gradeLevel,
        price: price || 0,
        isFree: !price || price === 0,
        tags: tags || [],
        coverImage,
      });
      
      return res.status(201).json({ success: true, data: channel });
    } catch (error) {
      console.error('Create channel error:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }
  
  return res.status(405).json({ error: 'Method not allowed' });
}

export default requireRole(['teacher', 'admin'])(handler);