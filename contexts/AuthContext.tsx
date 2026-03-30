// src/contexts/AuthContext.tsx'
"use client";
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'student' | 'teacher' | 'admin';
  avatar: string;
  points: number;
  streak: number;
  badges: string[];
  grade?: number;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (token: string, user: User) => void;
  logout: () => void;
  signup: (userData: SignupData) => Promise<void>;
  updateUser: (userData: Partial<User>) => void;
  isLoading: boolean;
}

interface SignupData {
  name: string;
  email: string;
  password: string;
  role: 'student' | 'teacher';
  grade?: number;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  
  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');
    
    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(JSON.parse(storedUser));
    }
    
    setIsLoading(false);
  }, []);
  
  const login = (newToken: string, newUser: User) => {
    localStorage.setItem('token', newToken);
    localStorage.setItem('user', JSON.stringify(newUser));
    setToken(newToken);
    setUser(newUser);
  };
  
  const signup = async (userData: SignupData) => {
    try {
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData),
      });
      
      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error || 'Signup failed');
      }
      
      login(result.token, result.user);
      toast.success('Account created successfully!');
      
      // Redirect based on role
      if (result.user.role === 'teacher') {
        router.push('/dashboard/teacher/channels');
      } else {
        router.push('/dashboard/student/quizzes');
      }
    } catch (error: any) {
      toast.error(error.message || 'Signup failed');
      throw error;
    }
  };
  
  const updateUser = (userData: Partial<User>) => {
    if (user) {
      const updatedUser = { ...user, ...userData };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      setUser(updatedUser);
    }
  };
  
  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
    router.push('/auth/login');
    toast.success('Logged out successfully');
  };
  
  return (
    <AuthContext.Provider value={{ user, token, login, logout, signup, updateUser, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}