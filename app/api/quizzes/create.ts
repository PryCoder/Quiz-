// src/pages/api/quizzes/create.ts
import { NextApiRequest, NextApiResponse } from 'next';
import dbConnect from '@/lib/db';
import Quiz from '@/models/Quiz';
import Question from '@/models/Question';
import Channel from '@/models/Channel';
import { generateQuestions } from '@/lib/ai';
import { requireRole } from '@/lib/auth';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  
  try {
    await dbConnect();
    const user = (req as any).user;
    
    const {
      title,
      description,
      channelId,
      timeLimit,
      difficulty,
      tags,
      aiGenerate,
      aiParams,
    } = req.body;
    
    if (!title || !description || !channelId) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    
    const channel = await Channel.findById(channelId);
    if (!channel) {
      return res.status(404).json({ error: 'Channel not found' });
    }
    
    if (channel.teacherId.toString() !== user.id && user.role !== 'admin') {
      return res.status(403).json({ error: 'Not authorized to create quiz for this channel' });
    }
    
    const quiz = await Quiz.create({
      title,
      description,
      channelId,
      createdBy: user.id,
      timeLimit: timeLimit || 30,
      difficulty: difficulty || 'medium',
      tags: tags || [],
      status: 'draft',
    });
    
    let questions = [];
    
    if (aiGenerate && aiParams) {
      const generatedQuestions = await generateQuestions({
        topic: aiParams.topic,
        gradeLevel: aiParams.gradeLevel || channel.gradeLevel,
        difficulty: aiParams.difficulty || difficulty || 'medium',
        type: aiParams.type || 'mcq',
        count: aiParams.count || 10,
      });
      
      for (const q of generatedQuestions) {
        const question = await Question.create({
          quizId: quiz._id,
          text: q.text,
          type: aiParams.type || 'mcq',
          options: q.options,
          correctAnswer: q.correctAnswer,
          explanation: q.explanation,
          difficulty: aiParams.difficulty || difficulty || 'medium',
          points: 10,
          isAIGenerated: true,
          isApproved: false,
          tags: tags || [],
          metadata: {
            topic: aiParams.topic,
            gradeLevel: aiParams.gradeLevel || channel.gradeLevel,
          },
        });
        questions.push(question._id);
      }
    }
    
    quiz.questions = questions;
    quiz.totalPoints = questions.length * 10;
    await quiz.save();
    
    return res.status(201).json({
      success: true,
      message: 'Quiz created successfully',
      data: quiz,
    });
  } catch (error) {
    console.error('Create quiz error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}