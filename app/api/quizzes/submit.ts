// src/pages/api/quizzes/submit.ts
import { NextApiRequest, NextApiResponse } from 'next';
import dbConnect from '@/lib/db';
import Quiz from '@/models/Quiz';
import Question from '@/models/Question';
import Attempt from '@/models/Attempt';
import { validateQuizAttempt, randomizeQuestions } from '@/utils/antiCheat';
import { awardPoints, calculateQuizPoints, updateStreak } from '@/utils/gamification';
import { requireAuth } from '@/lib/auth';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  
  try {
    await dbConnect();
    const user = (req as any).user;
    
    const { quizId, answers, timeSpent, deviceInfo } = req.body;
    
    if (!quizId || !answers) {
      return res.status(400).json({ error: 'Quiz ID and answers are required' });
    }
    
    const quiz = await Quiz.findById(quizId);
    if (!quiz) {
      return res.status(404).json({ error: 'Quiz not found' });
    }
    
    const questions = await Question.find({ _id: { $in: quiz.questions } });
    
    const validation = await validateQuizAttempt(
      user.id,
      quizId,
      answers,
      req.headers['x-forwarded-for'] as string || req.socket.remoteAddress || '',
      deviceInfo || '{}',
      {
        maxAttempts: 3,
        timeWindowMinutes: 60,
        minTimePerQuestionSeconds: 2,
        maxTimePerQuestionSeconds: 300,
        allowedIPChanges: 2,
      }
    );
    
    if (!validation.valid) {
      return res.status(400).json({ error: validation.reason });
    }
    
    let score = 0;
    let totalPoints = 0;
    const processedAnswers = [];
    
    for (const answer of answers) {
      const question = questions.find(q => q._id.toString() === answer.questionId);
      if (!question) continue;
      
      totalPoints += question.points;
      const isCorrect = question.correctAnswer.toLowerCase() === answer.answer.toLowerCase();
      
      if (isCorrect) {
        score += question.points;
      }
      
      processedAnswers.push({
        questionId: question._id,
        answer: answer.answer,
        isCorrect,
        timeSpent: answer.timeSpent,
      });
    }
    
    const percentage = (score / totalPoints) * 100;
    
    const attempt = await Attempt.create({
      userId: user.id,
      quizId,
      channelId: quiz.channelId,
      score,
      totalPoints,
      percentage,
      answers: processedAnswers,
      timeSpent,
      isCompleted: true,
      completedAt: new Date(),
      attempts: 1,
      deviceInfo,
      ipAddress: req.headers['x-forwarded-for'] || req.socket.remoteAddress,
    });
    
    const quizPoints = await calculateQuizPoints(
      quizId,
      user.id,
      percentage,
      timeSpent,
      quiz.timeLimit * 60
    );
    
    await awardPoints(user.id, quizPoints, `Completed quiz: ${quiz.title}`);
    await updateStreak(user.id);
    
    quiz.attemptsCount += 1;
    quiz.averageScore = ((quiz.averageScore * (quiz.attemptsCount - 1)) + percentage) / quiz.attemptsCount;
    await quiz.save();
    
    return res.status(200).json({
      success: true,
      data: {
        attemptId: attempt._id,
        score,
        totalPoints,
        percentage,
        pointsEarned: quizPoints,
        answers: processedAnswers,
      },
    });
  } catch (error) {
    console.error('Submit quiz error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}