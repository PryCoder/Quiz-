// src/utils/gamification.ts
import dbConnect from '@/lib/db';
import User from '@/models/User';
import Attempt from '@/models/Attempt';

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  requirement: (user: any) => Promise<boolean> | boolean;
}

const badges: Badge[] = [
  {
    id: 'first_quiz',
    name: 'Quiz Beginner',
    description: 'Complete your first quiz',
    icon: '🎯',
    requirement: async (user) => {
      const attempts = await Attempt.countDocuments({ userId: user._id });
      return attempts >= 1;
    },
  },
  {
    id: 'perfect_score',
    name: 'Perfect Score',
    description: 'Get 100% on any quiz',
    icon: '💯',
    requirement: async (user) => {
      const perfectAttempt = await Attempt.findOne({
        userId: user._id,
        percentage: 100,
      });
      return !!perfectAttempt;
    },
  },
  {
    id: 'streak_7',
    name: 'Weekly Warrior',
    description: 'Maintain a 7-day streak',
    icon: '🔥',
    requirement: async (user) => {
      return user.streak >= 7;
    },
  },
  {
    id: 'streak_30',
    name: 'Monthly Master',
    description: 'Maintain a 30-day streak',
    icon: '🏆',
    requirement: async (user) => {
      return user.streak >= 30;
    },
  },
  {
    id: 'quiz_master',
    name: 'Quiz Master',
    description: 'Complete 50 quizzes',
    icon: '👑',
    requirement: async (user) => {
      const attempts = await Attempt.countDocuments({ userId: user._id });
      return attempts >= 50;
    },
  },
  {
    id: 'top_10',
    name: 'Top Performer',
    description: 'Rank in top 10 of any leaderboard',
    icon: '📊',
    requirement: async (user) => {
      // Implementation depends on leaderboard system
      return false;
    },
  },
];

export async function checkAndAwardBadges(userId: string) {
  await dbConnect();
  
  const user = await User.findById(userId);
  if (!user) return;
  
  const newBadges = [];
  
  for (const badge of badges) {
    if (!user.badges.includes(badge.id)) {
      const earned = await badge.requirement(user);
      if (earned) {
        user.badges.push(badge.id);
        newBadges.push(badge);
      }
    }
  }
  
  if (newBadges.length > 0) {
    await user.save();
  }
  
  return newBadges;
}

export async function updateStreak(userId: string) {
  await dbConnect();
  
  const user = await User.findById(userId);
  if (!user) return;
  
  const lastAttempt = await Attempt.findOne({ userId })
    .sort({ completedAt: -1 });
  
  if (!lastAttempt) return;
  
  const lastAttemptDate = new Date(lastAttempt.completedAt);
  const today = new Date();
  const daysDiff = Math.floor((today.getTime() - lastAttemptDate.getTime()) / (1000 * 60 * 60 * 24));
  
  if (daysDiff === 1) {
    user.streak += 1;
    await user.save();
  } else if (daysDiff > 1) {
    user.streak = 0;
    await user.save();
  }
  
  return user.streak;
}

export async function awardPoints(
  userId: string,
  points: number,
  reason: string
) {
  await dbConnect();
  
  const user = await User.findById(userId);
  if (!user) return;
  
  user.points += points;
  await user.save();
  
  return {
    totalPoints: user.points,
    pointsAwarded: points,
    reason,
  };
}

export async function calculateQuizPoints(
  quizId: string,
  userId: string,
  percentage: number,
  timeSpent: number,
  totalTime: number
): Promise<number> {
  const basePoints = 100;
  const percentageBonus = percentage;
  const timeBonus = Math.max(0, (1 - timeSpent / totalTime) * 50);
  
  let totalPoints = basePoints + percentageBonus + timeBonus;
  
  if (percentage === 100) {
    totalPoints += 50;
  }
  
  const attemptCount = await Attempt.countDocuments({ quizId, userId, isCompleted: true });
  if (attemptCount === 1) {
    totalPoints += 25;
  }
  
  return Math.floor(totalPoints);
}