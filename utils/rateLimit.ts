// src/utils/rateLimit.ts
import { NextApiRequest, NextApiResponse } from 'next';
import NodeCache from 'node-cache';

const rateLimitCache = new NodeCache({ stdTTL: 60 });

interface RateLimitOptions {
  windowMs: number;
  max: number;
}

export default function rateLimit(options: RateLimitOptions) {
  return async (req: NextApiRequest, res: NextApiResponse) => {
    const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'unknown';
    const key = `rate-limit:${ip}`;
    
    const current = (rateLimitCache.get(key) as number) || 0;
    
    if (current >= options.max) {
      throw new Error('Too many requests');
    }
    
    rateLimitCache.set(key, current + 1, options.windowMs / 1000);
  };
}