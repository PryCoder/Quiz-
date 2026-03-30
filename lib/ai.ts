// src/lib/ai.ts
import OpenAI from 'openai';
import { cacheAIResponse } from '@/utils/cache';
import dbConnect from './db';
import Question from '@/models/Question';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export interface QuestionGenerationParams {
  topic: string;
  gradeLevel: number;
  difficulty: 'easy' | 'medium' | 'hard';
  type: 'mcq' | 'true-false' | 'nat';
  count?: number;
}

export async function generateQuestions(params: QuestionGenerationParams) {
  const cacheKey = `${params.topic}-${params.gradeLevel}-${params.difficulty}-${params.type}`;
  const cached = await cacheAIResponse(cacheKey);
  
  if (cached) {
    return cached;
  }
  
  const prompts = {
    mcq: `Generate ${params.count || 5} multiple choice questions about ${params.topic} for grade ${params.gradeLevel} with ${params.difficulty} difficulty. 
           Format each question as JSON with: text, options (array of 4), correctAnswer, explanation.`,
    'true-false': `Generate ${params.count || 5} true/false questions about ${params.topic} for grade ${params.gradeLevel} with ${params.difficulty} difficulty.
                   Format each question as JSON with: text, correctAnswer (true/false), explanation.`,
    nat: `Generate ${params.count || 5} numerical answer questions about ${params.topic} for grade ${params.gradeLevel} with ${params.difficulty} difficulty.
          Format each question as JSON with: text, correctAnswer (number), explanation.`,
  };
  
  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: 'You are an expert educational content creator. Generate accurate, age-appropriate questions.',
        },
        {
          role: 'user',
          content: prompts[params.type],
        },
      ],
      temperature: 0.7,
      max_tokens: 2000,
    });
    
    const content = completion.choices[0].message.content;
    let questions;
    
    try {
      questions = JSON.parse(content || '[]');
    } catch {
      questions = extractQuestionsFromText(content || '');
    }
    
    await cacheAIResponse(cacheKey, questions, 3600);
    
    return questions;
  } catch (error) {
    console.error('AI generation error:', error);
    throw new Error('Failed to generate questions');
  }
}

export async function generateHint(questionText: string, topic: string): Promise<string> {
  const cacheKey = `hint-${questionText.substring(0, 50)}`;
  const cached = await cacheAIResponse(cacheKey);
  
  if (cached) {
    return cached;
  }
  
  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: 'You are a helpful tutor. Provide concise, helpful hints without giving away the full answer.',
        },
        {
          role: 'user',
          content: `Provide a hint for this ${topic} question: "${questionText}"`,
        },
      ],
      temperature: 0.5,
      max_tokens: 150,
    });
    
    const hint = completion.choices[0].message.content || 'Think about the key concepts in this topic.';
    await cacheAIResponse(cacheKey, hint, 7200);
    
    return hint;
  } catch (error) {
    console.error('Hint generation error:', error);
    return 'Review the material and think carefully about the concepts.';
  }
}

function extractQuestionsFromText(text: string): any[] {
  const questions = [];
  const lines = text.split('\n');
  let currentQuestion: any = {};
  
  for (const line of lines) {
    if (line.match(/^\d+\./)) {
      if (currentQuestion.text) {
        questions.push(currentQuestion);
      }
      currentQuestion = { text: line.replace(/^\d+\.\s*/, '') };
    } else if (line.includes('Answer:')) {
      currentQuestion.correctAnswer = line.split('Answer:')[1].trim();
    } else if (line.includes('Explanation:')) {
      currentQuestion.explanation = line.split('Explanation:')[1].trim();
    } else if (line.includes('A)') || line.includes('B)') || line.includes('C)') || line.includes('D)')) {
      if (!currentQuestion.options) currentQuestion.options = [];
      currentQuestion.options.push(line.trim());
    }
  }
  
  if (currentQuestion.text) {
    questions.push(currentQuestion);
  }
  
  return questions;
}

export async function checkDuplicateQuestion(questionText: string, quizId: string): Promise<boolean> {
  await dbConnect();
  
  const similarQuestion = await Question.findOne({
    quizId,
    text: { $regex: new RegExp(questionText.substring(0, 50), 'i') },
  });
  
  return !!similarQuestion;
}