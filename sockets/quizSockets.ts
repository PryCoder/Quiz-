// src/sockets/quizSocket.ts
import { Server as SocketServer } from 'socket.io';
import { Server as HTTPServer } from 'http';
import dbConnect from '@/lib/db';
import Attempt from '@/models/Attempt';
import User from '@/models/User';

interface QuizSession {
  quizId: string;
  userId: string;
  startTime: Date;
  answers: any[];
  currentQuestion: number;
}

const activeSessions = new Map<string, QuizSession>();

export function initSocketServer(server: HTTPServer) {
  const io = new SocketServer(server, {
    cors: {
      origin: process.env.NEXT_PUBLIC_APP_URL,
      methods: ['GET', 'POST'],
    },
  });
  
  io.on('connection', (socket) => {
    console.log('Client connected:', socket.id);
    
    socket.on('join-quiz', async (data: { quizId: string, userId: string }) => {
      const sessionKey = `${data.quizId}:${data.userId}`;
      
      activeSessions.set(sessionKey, {
        quizId: data.quizId,
        userId: data.userId,
        startTime: new Date(),
        answers: [],
        currentQuestion: 0,
      });
      
      socket.join(`quiz:${data.quizId}`);
      socket.join(`user:${data.userId}`);
      
      socket.emit('quiz-joined', { success: true });
    });
    
    socket.on('submit-answer', async (data: {
      quizId: string;
      userId: string;
      questionId: string;
      answer: string;
      timeSpent: number;
    }) => {
      const sessionKey = `${data.quizId}:${data.userId}`;
      const session = activeSessions.get(sessionKey);
      
      if (session) {
        session.answers.push({
          questionId: data.questionId,
          answer: data.answer,
          timeSpent: data.timeSpent,
        });
        
        session.currentQuestion++;
        
        socket.to(`quiz:${data.quizId}`).emit('leaderboard-update', {
          userId: data.userId,
          progress: session.answers.length,
        });
      }
    });
    
    socket.on('complete-quiz', async (data: {
      quizId: string;
      userId: string;
      totalTime: number;
    }) => {
      const sessionKey = `${data.quizId}:${data.userId}`;
      const session = activeSessions.get(sessionKey);
      
      if (session) {
        await dbConnect();
        
        const score = calculateScore(session.answers);
        const attempt = await Attempt.create({
          userId: data.userId,
          quizId: data.quizId,
          score: score.score,
          totalPoints: score.totalPoints,
          percentage: score.percentage,
          answers: session.answers,
          timeSpent: data.totalTime,
          isCompleted: true,
          completedAt: new Date(),
        });
        
        const user = await User.findById(data.userId);
        if (user) {
          user.points += score.score;
          await user.save();
        }
        
        io.to(`quiz:${data.quizId}`).emit('quiz-completed', {
          userId: data.userId,
          score: score.score,
          percentage: score.percentage,
        });
        
        activeSessions.delete(sessionKey);
        
        socket.emit('result', attempt);
      }
    });
    
    socket.on('disconnect', () => {
      console.log('Client disconnected:', socket.id);
    });
  });
  
  return io;
}

function calculateScore(answers: any[]): { score: number; totalPoints: number; percentage: number } {
  let score = 0;
  let totalPoints = 0;
  
  for (const answer of answers) {
    totalPoints += answer.points || 10;
    if (answer.isCorrect) {
      score += answer.points || 10;
    }
  }
  
  const percentage = totalPoints > 0 ? (score / totalPoints) * 100 : 0;
  
  return { score, totalPoints, percentage };
}