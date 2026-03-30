// src/lib/auth.ts
import jwt from 'jsonwebtoken';
import { NextApiRequest, NextApiResponse } from 'next';
import User, { IUser } from '@/models/User';
import dbConnect from './db';

const JWT_SECRET = process.env.JWT_SECRET!;

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: string;
}

export function generateToken(user: IUser): string {
  return jwt.sign(
    {
      id: user._id,
      email: user.email,
      name: user.name,
      role: user.role,
    },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
}

export function verifyToken(token: string): AuthUser | null {
  try {
    return jwt.verify(token, JWT_SECRET) as AuthUser;
  } catch (error) {
    return null;
  }
}

export async function authenticateUser(req: NextApiRequest, res: NextApiResponse): Promise<AuthUser | null> {
  const token = req.headers.authorization?.replace('Bearer ', '');
  
  if (!token) {
    return null;
  }
  
  const decoded = verifyToken(token);
  if (!decoded) {
    return null;
  }
  
  await dbConnect();
  const user = await User.findById(decoded.id).select('-password');
  
  if (!user) {
    return null;
  }
  
  return {
    id: user._id.toString(),
    email: user.email,
    name: user.name,
    role: user.role,
  };
}

export function requireAuth(handler: Function) {
  return async (req: NextApiRequest, res: NextApiResponse) => {
    const user = await authenticateUser(req, res);
    
    if (!user) {
      return res.status(401).json({ error: 'Authentication required' });
    }
    
    (req as any).user = user;
    return handler(req, res);
  };
}

export function requireRole(roles: string[]) {
  return (handler: Function) => {
    return async (req: NextApiRequest, res: NextApiResponse) => {
      const user = await authenticateUser(req, res);
      
      if (!user || !roles.includes(user.role)) {
        return res.status(403).json({ error: 'Insufficient permissions' });
      }
      
      (req as any).user = user;
      return handler(req, res);
    };
  };
}