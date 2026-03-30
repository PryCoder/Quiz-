// src/utils/antiCheat.ts
import { NextApiRequest } from 'next';
import dbConnect from '@/lib/db';
import Attempt from '@/models/Attempt';

export interface AntiCheatConfig {
  maxAttempts: number;
  timeWindowMinutes: number;
  minTimePerQuestionSeconds: number;
  maxTimePerQuestionSeconds: number;
  allowedIPChanges: number;
}

export async function validateQuizAttempt(
  userId: string,
  quizId: string,
  answers: any[],
  ipAddress: string,
  deviceInfo: string,
  config: AntiCheatConfig
): Promise<{ valid: boolean; reason?: string }> {
  await dbConnect();
  
  const attempts = await Attempt.find({
    userId,
    quizId,
    completedAt: { $exists: true },
  });
  
  if (attempts.length >= config.maxAttempts) {
    return { valid: false, reason: 'Maximum attempts reached' };
  }
  
  const recentAttempts = attempts.filter(attempt => {
    const timeSince = Date.now() - new Date(attempt.createdAt).getTime();
    return timeSince < config.timeWindowMinutes * 60 * 1000;
  });
  
  if (recentAttempts.length >= 3) {
    return { valid: false, reason: 'Too many attempts in short period' };
  }
  
  const suspiciousIPChanges = checkIPChanges(attempts, ipAddress, config.allowedIPChanges);
  if (!suspiciousIPChanges.valid) {
    return suspiciousIPChanges;
  }
  
  const timeValidation = validateAnswerTimes(answers, config);
  if (!timeValidation.valid) {
    return timeValidation;
  }
  
  const tabSwitchValidation = checkTabSwitches(deviceInfo);
  if (!tabSwitchValidation.valid) {
    return tabSwitchValidation;
  }
  
  return { valid: true };
}

function checkIPChanges(
  attempts: any[],
  currentIP: string,
  maxChanges: number
): { valid: boolean; reason?: string } {
  const uniqueIPs = new Set(attempts.map(a => a.ipAddress).filter(Boolean));
  uniqueIPs.add(currentIP);
  
  if (uniqueIPs.size > maxChanges) {
    return { valid: false, reason: 'Multiple IP addresses detected' };
  }
  
  return { valid: true };
}

function validateAnswerTimes(
  answers: any[],
  config: AntiCheatConfig
): { valid: boolean; reason?: string } {
  for (const answer of answers) {
    if (answer.timeSpent < config.minTimePerQuestionSeconds) {
      return { valid: false, reason: 'Answers submitted too quickly' };
    }
    
    if (answer.timeSpent > config.maxTimePerQuestionSeconds) {
      return { valid: false, reason: 'Answers took too long' };
    }
  }
  
  return { valid: true };
}

function checkTabSwitches(deviceInfo: string): { valid: boolean; reason?: string } {
  try {
    const info = JSON.parse(deviceInfo);
    if (info.tabSwitches > 3) {
      return { valid: false, reason: 'Excessive tab switching detected' };
    }
  } catch {
    // Invalid device info format
  }
  
  return { valid: true };
}

export function randomizeQuestions(questions: any[]): any[] {
  return [...questions].sort(() => Math.random() - 0.5);
}

export function randomizeOptions(question: any): any {
  if (question.type === 'mcq' && question.options) {
    const options = [...question.options];
    const correctAnswer = question.correctAnswer;
    
    for (let i = options.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [options[i], options[j]] = [options[j], options[i]];
    }
    
    const newCorrectIndex = options.indexOf(correctAnswer);
    return {
      ...question,
      options,
      correctAnswer,
    };
  }
  
  return question;
}