export interface MoodEntry {
  id: string;
  timestamp: Date;
  mood: MoodType;
  intensity: number; // 1-10
  notes?: string;
  voiceAnalysis?: VoiceAnalysis;
  tags?: string[];
}

export interface VoiceAnalysis {
  tone: 'calm' | 'stressed' | 'happy' | 'sad' | 'anxious';
  energy: number; // 1-10
  clarity: number; // 1-10
}

export interface AIMessage {
  id: string;
  content: string;
  timestamp: Date;
  isUser: boolean;
  emotion?: string;
  suggestions?: string[];
}

export interface UserProfile {
  id: string;
  name: string;
  onboardingCompleted: boolean;
  preferences: {
    theme: 'light' | 'dark';
    notificationsEnabled: boolean;
    voiceAnalysis: boolean;
  };
  streak: number;
  achievements: Achievement[];
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  earned: boolean;
  earnedAt?: Date;
}

export type MoodType = 'excellent' | 'good' | 'okay' | 'low' | 'terrible';

export interface TherapyModule {
  id: string;
  title: string;
  description: string;
  type: 'CBT' | 'DBT' | 'Mindfulness' | 'Breathing';
  progress: number;
  duration: number; // minutes
  color: string;
}

export interface MoodAnalysis {
  mood: MoodType;
  intensity: number;
  tags: string[];
  insights?: string[];
}