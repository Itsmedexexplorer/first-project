import { useContext } from 'react';
import { AICompanionContext } from '@/contexts/AICompanionContext';

export function useAICompanion() {
  const context = useContext(AICompanionContext);
  if (!context) {
    throw new Error('useAICompanion must be used within AICompanionProvider');
  }
  return context;
}