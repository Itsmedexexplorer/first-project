import { useContext } from 'react';
import { PsychometricContext } from '@/contexts/PsychometricContext';

export function usePsychometric() {
  const context = useContext(PsychometricContext);
  if (!context) {
    throw new Error('usePsychometric must be used within PsychometricProvider');
  }
  return context;
}