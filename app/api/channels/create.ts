// src/pages/api/channels/create.ts
import { NextApiRequest, NextApiResponse } from 'next';
import dbConnect from '@/lib/db';
import Channel from '@/models/Channel';
import { requireRole } from '@/lib/auth';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  
  try {
    await dbConnect();
    const user = (req as any).user;
    
    const {
      name,
      description,
      subject,
      gradeLevel,
      price,
      tags,
      coverImage,
    } = req.body;
    
    if (!name || !description || !subject || !gradeLevel) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    
    const existingChannel = await Channel.findOne({ name, teacherId: user.id });
    if (existingChannel) {
      return res.status(400).json({ error: 'You already have a channel with this name' });
    }
    
    const channel = await Channel.create({
      name,
      description,
      teacherId: user.id,
      subject,
      gradeLevel,
      price: price || 0,
      isFree: !price || price === 0,
      tags: tags || [],
      coverImage: coverImage || null,
    });
    
    return res.status(201).json({
      success: true,
      message: 'Channel created successfully',
      data: channel,
    });
  } catch (error: any) {
    console.error('Create channel error:', error);
    
    if (error.code === 11000) {
      return res.status(400).json({ error: 'Channel name already exists' });
    }
    
    return res.status(500).json({ error: 'Internal server error' });
  }
}