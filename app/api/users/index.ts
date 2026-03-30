// src/pages/api/users/index.ts
import { NextApiRequest, NextApiResponse } from 'next';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import { requireAuth, requireRole } from '@/lib/auth';

async function handler(req: NextApiRequest, res: NextApiResponse) {
  await dbConnect();

  if (req.method === 'GET') {
    try {
      const { page = 1, limit = 20, role, search } = req.query;
      
      const query: any = {};
      if (role) query.role = role;
      if (search) {
        query.$or = [
          { name: { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } },
        ];
      }
      
      const users = await User.find(query)
        .select('-password')
        .limit(Number(limit))
        .skip((Number(page) - 1) * Number(limit))
        .sort({ createdAt: -1 });
      
      const total = await User.countDocuments(query);
      
      return res.status(200).json({
        success: true,
        data: users,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          pages: Math.ceil(total / Number(limit)),
        },
      });
    } catch (error) {
      console.error('Get users error:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }
  
  if (req.method === 'PUT') {
    try {
      const { userId, updates } = req.body;
      
      const user = await User.findByIdAndUpdate(
        userId,
        { $set: updates },
        { new: true, runValidators: true }
      ).select('-password');
      
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }
      
      return res.status(200).json({ success: true, data: user });
    } catch (error) {
      console.error('Update user error:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }
  
  return res.status(405).json({ error: 'Method not allowed' });
}

export default requireRole(['admin', 'teacher'])(handler);