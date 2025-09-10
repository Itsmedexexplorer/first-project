import React, { useState, useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { View, Text } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SplashScreen from 'expo-splash-screen';

import { AuthProvider } from '@/contexts/AuthContext';
import { MoodProvider } from '@/contexts/MoodContext';
import { AICompanionProvider } from '@/contexts/AICompanionContext';
import { PsychometricProvider } from '@/contexts/PsychometricContext';
import OnboardingScreen from '@/components/onboarding/OnboardingScreen';

// Prevent the splash screen from auto-hiding
SplashScreen.preventAutoHideAsync();

// Error Boundary Component
class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error?: Error }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: any) {
    console.error('App Error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
          <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 10 }}>
            Something went wrong
          </Text>
          <Text style={{ textAlign: 'center', color: '#666' }}>
            Please restart the app. If the problem persists, contact support.
          </Text>
        </View>
      );
    }

    return this.props.children as React.ReactElement;
  }
}

export default function RootLayout() {
  const [isOnboardingComplete, setIsOnboardingComplete] = useState<boolean | null>(null);
  const [initError, setInitError] = useState<string | null>(null);

  useEffect(() => {
    checkOnboardingStatus();
  }, []);

    const checkOnboardingStatus = async () => {
    try {
      // Add a small delay for mobile devices
      await new Promise(resolve => setTimeout(resolve, 100));
      
      const completed = await AsyncStorage.getItem('onboarding_completed');
      setIsOnboardingComplete(completed === 'true');
      
      console.log('Onboarding status:', completed === 'true' ? 'completed' : 'not completed');
    } catch (error) {
      console.error('Error checking onboarding status:', error);
      // Default to showing onboarding on error
      setIsOnboardingComplete(false);
    } finally {
      try {
        await SplashScreen.hideAsync();
      } catch (error) {
        console.error('Error hiding splash screen:', error);
      }
    }
  };

  const handleOnboardingComplete = async () => {
    try {
      await AsyncStorage.setItem('onboarding_completed', 'true');
      console.log('Onboarding completed and saved');
      setIsOnboardingComplete(true);
    } catch (error) {
      console.error('Error saving onboarding status:', error);
      // Still proceed even if saving fails
      setIsOnboardingComplete(true);
    }
  };

  // Show error state
  if (initError) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
        <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 10, color: '#FF3838' }}>
          Initialization Error
        </Text>
        <Text style={{ textAlign: 'center', color: '#666' }}>
          {initError}
        </Text>
      </View>
    );
  }

  // Show loading state while checking onboarding status
  if (isOnboardingComplete === null) {
    return null;
  }

  // Show onboarding if not completed
  if (!isOnboardingComplete) {
    return (
      <ErrorBoundary>
        <OnboardingScreen onComplete={handleOnboardingComplete} />
      </ErrorBoundary>
    );
  }

    // Show main app
  return (
    <ErrorBoundary>
      <AuthProvider>
        <PsychometricProvider>
          <MoodProvider>
            <AICompanionProvider>
              <Stack screenOptions={{ headerShown: false }}>
                <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
                <Stack.Screen name="login" options={{ headerShown: false }} />
                <Stack.Screen name="psychometric" options={{ headerShown: false }} />
                <Stack.Screen name="+not-found" />
              </Stack>
              <StatusBar style="auto" />
            </AICompanionProvider>
          </MoodProvider>
        </PsychometricProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}