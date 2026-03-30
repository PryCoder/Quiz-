// src/utils/adaptive.ts
import dbConnect from '@/lib/db';
import Attempt from '@/models/Attempt';
import Question from '@/models/Question';

export interface AdaptiveConfig {
  initialDifficulty: 'easy' | 'medium' | 'hard';
  maxDifficulty: 'easy' | 'medium' | 'hard';
  minDifficulty: 'easy' | 'medium' | 'hard';
  adjustmentFactor: number;
}

export async function calculateNextDifficulty(
  userId: string,
  quizId: string,
  currentDifficulty: string,
  lastAnswerCorrect: boolean,
  config: AdaptiveConfig
): Promise<string> {
  const difficulties = ['easy', 'medium', 'hard'];
  const currentIndex = difficulties.indexOf(currentDifficulty);
  
  const recentAttempts = await Attempt.find({
    userId,
    quizId,
    isCompleted: true,
  })
    .sort({ createdAt: -1 })
    .limit(5);
  
  const recentPerformance = recentAttempts.reduce((acc, attempt) => {
    return acc + (attempt.percentage / 100);
  }, 0) / (recentAttempts.length || 1);
  
  let adjustment = 0;
  
  if (lastAnswerCorrect) {
    adjustment = config.adjustmentFactor;
  } else {
    adjustment = -config.adjustmentFactor;
  }
  
  if (recentPerformance > 0.8) {
    adjustment += 0.2;
  } else if (recentPerformance < 0.4) {
    adjustment -= 0.2;
  }
  
  let newIndex = currentIndex + Math.round(adjustment);
  newIndex = Math.max(0, Math.min(difficulties.length - 1, newIndex));
  
  const minIndex = difficulties.indexOf(config.minDifficulty);
  const maxIndex = difficulties.indexOf(config.maxDifficulty);
  newIndex = Math.max(minIndex, Math.min(maxIndex, newIndex));
  
  return difficulties[newIndex];
}

export async function selectAdaptiveQuestions(
  userId: string,
  quizId: string,
  totalQuestions: number,
  topics: string[]
) {
  await dbConnect();
  
  const userAttempts = await Attempt.find({ userId, quizId }).select('answers');
  const weakTopics = identifyWeakTopics(userAttempts, topics);
  
  const questions = [];
  
  for (let i = 0; i < totalQuestions; i++) {
    const priorityTopic = weakTopics[i % weakTopics.length] || topics[i % topics.length];
    const difficulty = await calculateAdaptiveDifficulty(userId, quizId);
    
    const question = await Question.aggregate([
      {
        $match: {
          'metadata.topic': priorityTopic,
          difficulty,
          isApproved: true,
          quizId: { $ne: quizId },
        },
      },
      { $sample: { size: 1 } },
    ]);
    
    if (question.length > 0) {
      questions.push(question[0]);
    } else {
      const fallbackQuestion = await Question.aggregate([
        { $match: { isApproved: true } },
        { $sample: { size: 1 } },
      ]);
      questions.push(fallbackQuestion[0]);
    }
  }
  
  return questions;
}

function identifyWeakTopics(attempts: any[], topics: string[]): string[] {
  const topicPerformance: Record<string, { correct: number; total: number }> = {};
  
  for (const attempt of attempts) {
    for (const answer of attempt.answers) {
      if (answer.questionId?.metadata?.topic) {
        const topic = answer.questionId.metadata.topic;
        if (!topicPerformance[topic]) {
          topicPerformance[topic] = { correct: 0, total: 0 };
        }
        topicPerformance[topic].total++;
        if (answer.isCorrect) {
          topicPerformance[topic].correct++;
        }
      }
    }
  }
  
  const weakTopics = Object.entries(topicPerformance)
    .filter(([_, perf]) => (perf.correct / perf.total) < 0.6)
    .map(([topic]) => topic);
  
  return weakTopics.length > 0 ? weakTopics : topics;
}

async function calculateAdaptiveDifficulty(userId: string, quizId: string): Promise<string> {
  const recentAttempts = await Attempt.find({
    userId,
    quizId,
    isCompleted: true,
  })
    .sort({ createdAt: -1 })
    .limit(3);
  
  if (recentAttempts.length === 0) {
    return 'medium';
  }
  
  const avgScore = recentAttempts.reduce((sum, a) => sum + a.percentage, 0) / recentAttempts.length;
  
  if (avgScore > 80) return 'hard';
  if (avgScore > 60) return 'medium';
  return 'easy';
}