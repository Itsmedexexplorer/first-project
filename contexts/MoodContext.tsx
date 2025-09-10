import React, { createContext, ReactNode, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { MoodEntry, MoodType } from '@/types';
import { aiService } from '@/services/aiService';

interface MoodContextType {
  moods: MoodEntry[];
  currentStreak: number;
  isLoading: boolean;
  addMoodEntry: (mood: MoodType, intensity: number, notes?: string) => Promise<void>;
  deleteMoodEntry: (id: string) => Promise<void>;
  getMoodHistory: (days: number) => MoodEntry[];
  analyzeVoice: () => Promise<void>;
}

export const MoodContext = createContext<MoodContextType | undefined>(undefined);

export function MoodProvider({ children }: { children: ReactNode }) {
  const [moods, setMoods] = useState<MoodEntry[]>([]);
  const [currentStreak, setCurrentStreak] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
    loadMoods();
  }, []);

    const loadMoods = async () => {
    try {
      const stored = await AsyncStorage.getItem('moods');
      if (stored) {
        const parsedMoods = JSON.parse(stored).map((mood: any) => ({
          ...mood,
          timestamp: new Date(mood.timestamp)
        }));
        setMoods(parsedMoods);
        calculateStreak(parsedMoods);
      } else {
        // Initialize with empty array if no data
        setMoods([]);
        setCurrentStreak(0);
      }
    } catch (error) {
      console.error('Error loading moods:', error);
      // Initialize with empty state on error
      setMoods([]);
      setCurrentStreak(0);
    }
  };

  const saveMoods = async (newMoods: MoodEntry[]) => {
    try {
      await AsyncStorage.setItem('moods', JSON.stringify(newMoods));
    } catch (error) {
      console.error('Error saving moods:', error);
    }
  };

  const calculateStreak = (moodEntries: MoodEntry[]) => {
    const sortedMoods = [...moodEntries].sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
    let streak = 0;
    let currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0);

    for (const mood of sortedMoods) {
      const moodDate = new Date(mood.timestamp);
      moodDate.setHours(0, 0, 0, 0);
      
      if (moodDate.getTime() === currentDate.getTime()) {
        streak++;
        currentDate.setDate(currentDate.getDate() - 1);
      } else {
        break;
      }
    }
    
    setCurrentStreak(streak);
  };
  const addMoodEntry = async (mood: MoodType, intensity: number, notes?: string) => {
    setIsLoading(true);
    
    try {
      let analysis = undefined;
      let tags: string[] = [];
      
      if (notes && notes.trim()) {
        try {
          const textAnalysis = await aiService.analyzeMoodFromText(notes);
          tags = textAnalysis.tags || [];
        } catch (error) {
          console.error('Error analyzing mood text:', error);
          tags = ['Thank you for sharing your thoughts'];
        }
      }

      const newEntry: MoodEntry = {
        id: Date.now().toString(),
        timestamp: new Date(),
        mood,
        intensity,
        notes,
        voiceAnalysis: analysis,
        tags
      };

      const updatedMoods = [newEntry, ...moods];
      setMoods(updatedMoods);
      await saveMoods(updatedMoods);
      calculateStreak(updatedMoods);
    } catch (error) {
      console.error('Error adding mood entry:', error);
      throw new Error('Failed to save mood entry');
    } finally {
      setIsLoading(false);
    }
  };

  const deleteMoodEntry = async (id: string) => {
    const updatedMoods = moods.filter(mood => mood.id !== id);
    setMoods(updatedMoods);
    await saveMoods(updatedMoods);
    calculateStreak(updatedMoods);
  };

  const getMoodHistory = (days: number): MoodEntry[] => {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);
    
    return moods.filter(mood => mood.timestamp >= cutoffDate);
  };

  const analyzeVoice = async () => {
    setIsLoading(true);
    try {
      const analysis = await aiService.analyzeVoice();
      // Voice analysis would update the current mood entry
      console.log('Voice analysis:', analysis);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <MoodContext.Provider value={{
      moods,
      currentStreak,
      isLoading,
      addMoodEntry,
      deleteMoodEntry,
      getMoodHistory,
      analyzeVoice
    }}>
      {children}
    </MoodContext.Provider>
  );
}