import React, { createContext, ReactNode, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { PsychometricResponse, PsychometricResults } from '@/types/psychometric';

interface PsychometricContextType {
  responses: PsychometricResponse[];
  currentQuestionIndex: number;
  isCompleted: boolean;
  isLoading: boolean;
  addResponse: (questionId: string, value: number | string) => void;
  nextQuestion: () => void;
  previousQuestion: () => void;
  submitTest: () => Promise<void>;
  resetTest: () => void;
  getResults: () => Promise<PsychometricResults | null>;
}

export const PsychometricContext = createContext<PsychometricContextType | undefined>(undefined);

export function PsychometricProvider({ children }: { children: ReactNode }) {
  const [responses, setResponses] = useState<PsychometricResponse[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    checkTestStatus();
  }, []);

  const checkTestStatus = async () => {
    try {
      const completed = await AsyncStorage.getItem('psychometric_completed');
      const savedResponses = await AsyncStorage.getItem('psychometric_responses');
      
      if (completed === 'true') {
        setIsCompleted(true);
      }
      
      if (savedResponses) {
        const parsedResponses = JSON.parse(savedResponses).map((response: any) => ({
          ...response,
          timestamp: new Date(response.timestamp)
        }));
        setResponses(parsedResponses);
      }
    } catch (error) {
      console.error('Error checking test status:', error);
    }
  };

  const addResponse = (questionId: string, value: number | string) => {
    const newResponse: PsychometricResponse = {
      questionId,
      value,
      timestamp: new Date()
    };

    setResponses(prev => {
      const filtered = prev.filter(r => r.questionId !== questionId);
      return [...filtered, newResponse];
    });
  };

  const nextQuestion = () => {
    if (currentQuestionIndex < 9) { // 10 questions total
      setCurrentQuestionIndex(prev => prev + 1);
    }
  };

  const previousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };

  const analyzeResponses = (responses: PsychometricResponse[]) => {
    const responseMap = responses.reduce((acc, response) => {
      acc[response.questionId] = response.value;
      return acc;
    }, {} as Record<string, number | string>);

    // Social Connectivity Analysis
    const friends = responseMap.q2_friends as number || 0;
    const interaction = responseMap.q3_interaction as number || 0;
    const socialConnectivity = friends >= 5 && interaction >= 10 ? 'high' : 
                              friends >= 2 && interaction >= 5 ? 'moderate' : 'low';

    // Stress Level Analysis
    const stressLevel = responseMap.q6_stress_level as number || 5;
    const stressCategory = stressLevel <= 3 ? 'low' : stressLevel <= 7 ? 'moderate' : 'high';

    // Wellness Habits Analysis
    const sleepQuality = responseMap.q7_sleep_quality as string || 'fair';
    const selfCare = responseMap.q8_self_care as number || 0;
    const wellnessHabits = sleepQuality === 'excellent' && selfCare >= 5 ? 'excellent' :
                          sleepQuality === 'good' && selfCare >= 3 ? 'good' :
                          sleepQuality === 'fair' || selfCare >= 1 ? 'fair' : 'poor';

    // Emotional State Analysis
    const dailyMood = responseMap.q9_daily_mood as string || 'neutral_or_fluctuating';
    const futureOutlook = responseMap.q10_future_outlook as string || 'uncertain';
    const emotionalState = dailyMood === 'mostly_positive' && (futureOutlook === 'optimistic' || futureOutlook === 'cautiously_optimistic') ? 'positive' :
                          dailyMood === 'mostly_negative' || futureOutlook === 'pessimistic' ? 'negative' : 'neutral';

    // Support System Analysis
    const parentalComm = responseMap.q4_parental_communication as string || 'less_than_monthly';
    const parentalSharing = responseMap.q5_parental_sharing as string || 'never';
    const supportSystem = (parentalComm === 'daily' || parentalComm === 'several_times_a_week') && 
                         (parentalSharing === 'always' || parentalSharing === 'sometimes') && friends >= 3 ? 'strong' :
                         friends >= 1 && (parentalSharing === 'sometimes' || parentalSharing === 'rarely') ? 'moderate' : 'weak';

    return {
      socialConnectivity,
      stressLevel: stressCategory,
      wellnessHabits,
      emotionalState,
      supportSystem
    } as const;
  };

  const submitTest = async () => {
    setIsLoading(true);
    try {
      const userId = 'current_user'; // Replace with actual user ID
      const analysisProfile = analyzeResponses(responses);
      
      const results: PsychometricResults = {
        userId,
        responses,
        completedAt: new Date(),
        analysisProfile
      };

      await AsyncStorage.setItem('psychometric_results', JSON.stringify(results));
      await AsyncStorage.setItem('psychometric_completed', 'true');
      await AsyncStorage.setItem('psychometric_responses', JSON.stringify(responses));
      
      setIsCompleted(true);
    } catch (error) {
      console.error('Error submitting test:', error);
      throw new Error('Failed to submit test');
    } finally {
      setIsLoading(false);
    }
  };

  const resetTest = async () => {
    try {
      await AsyncStorage.multiRemove([
        'psychometric_results',
        'psychometric_completed',
        'psychometric_responses'
      ]);
      
      setResponses([]);
      setCurrentQuestionIndex(0);
      setIsCompleted(false);
    } catch (error) {
      console.error('Error resetting test:', error);
    }
  };

  const getResults = async (): Promise<PsychometricResults | null> => {
    try {
      const stored = await AsyncStorage.getItem('psychometric_results');
      if (stored) {
        const results = JSON.parse(stored);
        return {
          ...results,
          completedAt: new Date(results.completedAt),
          responses: results.responses.map((r: any) => ({
            ...r,
            timestamp: new Date(r.timestamp)
          }))
        };
      }
      return null;
    } catch (error) {
      console.error('Error getting results:', error);
      return null;
    }
  };

  return (
    <PsychometricContext.Provider value={{
      responses,
      currentQuestionIndex,
      isCompleted,
      isLoading,
      addResponse,
      nextQuestion,
      previousQuestion,
      submitTest,
      resetTest,
      getResults
    }}>
      {children}
    </PsychometricContext.Provider>
  );
}