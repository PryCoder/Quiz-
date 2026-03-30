// src/utils/cache.ts
import NodeCache from 'node-cache';

const cache = new NodeCache({
  stdTTL: 3600,
  checkperiod: 120,
});

export async function cacheAIResponse(key: string, data?: any, ttl?: number): Promise<any> {
  if (data !== undefined) {
    if (ttl !== undefined) {
      cache.set(key, data, ttl);
    } else {
      cache.set(key, data);
    }
    return data;
  }
  
  return cache.get(key);
}

export async function cacheQuizResult(quizId: string, userId: string, data: any): Promise<void> {
  const key = `quiz:${quizId}:user:${userId}`;
  cache.set(key, data, 300);
}

export async function getCachedQuizResult(quizId: string, userId: string): Promise<any> {
  const key = `quiz:${quizId}:user:${userId}`;
  return cache.get(key);
}

export async function invalidateUserCache(userId: string): Promise<void> {
  const keys = cache.keys();
  const userKeys = keys.filter(key => key.includes(userId));
  cache.del(userKeys);
}

export async function invalidateQuizCache(quizId: string): Promise<void> {
  const keys = cache.keys();
  const quizKeys = keys.filter(key => key.includes(quizId));
  cache.del(quizKeys);
}