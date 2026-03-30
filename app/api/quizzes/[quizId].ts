// src/pages/api/quizzes/[quizId].ts
import { NextApiRequest, NextApiResponse } from 'next';
import dbConnect from '@/lib/db';
import Quiz from '@/models/Quiz';
import Question from '@/models/Question';
import Attempt from '@/models/Attempt';
import { requireAuth } from '@/lib/auth';
import { randomizeQuestions, randomizeOptions } from '@/utils/antiCheat';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await dbConnect();
  
  const { quizId } = req.query;
  
  if (req.method === 'GET') {
    try {
      const user = (req as any).user;
      const quiz = await Quiz.findById(quizId)
        .populate('createdBy', 'name')
        .populate('channelId', 'name subject');
      
      if (!quiz) {
        return res.status(404).json({ error: 'Quiz not found' });
      }
      
      let questions = await Question.find({ _id: { $in: quiz.questions }, isApproved: true });
      
      if (user.role === 'student') {
        questions = randomizeQuestions(questions);
        questions = questions.map(q => randomizeOptions(q));
        
        questions = questions.map(q => ({
          _id: q._id,
          text: q.text,
          type: q.type,
          options: q.options,
          points: q.points,
        }));
      }
      
      const existingAttempt = await Attempt.findOne({
        userId: user.id,
        quizId,
        isCompleted: true,
      });
      
      return res.status(200).json({
        success: true,
        data: {
          ...quiz.toObject(),
          questions,
          hasAttempted: !!existingAttempt,
        },
      });
    } catch (error) {
      console.error('Get quiz error:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }
  
  if (req.method === 'PUT') {
    try {
      const user = (req as any).user;
      const updates = req.body;
      
      const quiz = await Quiz.findById(quizId);
      if (!quiz) {
        return res.status(404).json({ error: 'Quiz not found' });
      }
      
      if (quiz.createdBy.toString() !== user.id && user.role !== 'admin') {
        return res.status(403).json({ error: 'Not authorized to update this quiz' });
      }
      
      const updatedQuiz = await Quiz.findByIdAndUpdate(
        quizId,
        { $set: updates },
        { new: true, runValidators: true }
      );
      
      return res.status(200).json({ success: true, data: updatedQuiz });
    } catch (error) {
      console.error('Update quiz error:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }
  
  if (req.method === 'DELETE') {
    try {
      const user = (req as any).user;
      
      const quiz = await Quiz.findById(quizId);
      if (!quiz) {
        return res.status(404).json({ error: 'Quiz not found' });
      }
      
      if (quiz.createdBy.toString() !== user.id && user.role !== 'admin') {
        return res.status(403).json({ error: 'Not authorized to delete this quiz' });
      }
      
      await Question.deleteMany({ quizId });
      await Quiz.findByIdAndDelete(quizId);
      
      return res.status(200).json({ success: true, message: 'Quiz deleted successfully' });
    } catch (error) {
      console.error('Delete quiz error:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }
  
  return res.status(405).json({ error: 'Method not allowed' });
}