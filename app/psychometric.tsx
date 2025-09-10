import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withDelay
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';

import { usePsychometric } from '@/hooks/usePsychometric';
import { PSYCHOMETRIC_QUESTIONS } from '@/types/psychometric';
import { NeoBrutalism } from '@/constants/Colors';
import { scaleFont, scaleHeight, scaleWidth, getSpacing } from '@/utils/responsive';
import AnimatedButton from '@/components/ui/AnimatedButton';
import SliderQuestion from '@/components/psychometric/SliderQuestion';
import MCQQuestion from '@/components/psychometric/MCQQuestion';

export default function PsychometricScreen() {
  const insets = useSafeAreaInsets();
  const { 
    responses, 
    currentQuestionIndex, 
    isCompleted, 
    isLoading,
    addResponse, 
    nextQuestion, 
    previousQuestion, 
    submitTest 
  } = usePsychometric();

  const [showAlert, setShowAlert] = useState({ visible: false, title: '', message: '' });
  
  const headerOpacity = useSharedValue(0);
  const questionOpacity = useSharedValue(0);
  const progressOpacity = useSharedValue(0);

  useEffect(() => {
    // Aggressive entrance animations
    headerOpacity.value = withSpring(1, { damping: 8 });
    progressOpacity.value = withDelay(150, withSpring(1, { damping: 8 }));
    questionOpacity.value = withDelay(300, withSpring(1, { damping: 8 }));
  }, []);

  useEffect(() => {
    // Re-animate when question changes
    questionOpacity.value = 0;
    questionOpacity.value = withDelay(100, withSpring(1, { damping: 6 }));
  }, [currentQuestionIndex]);

  const showWebAlert = (title: string, message: string) => {
    if (Platform.OS === 'web') {
      setShowAlert({ visible: true, title, message });
    } else {
      Alert.alert(title, message);
    }
  };

  const currentQuestion = PSYCHOMETRIC_QUESTIONS[currentQuestionIndex];
  const currentResponse = responses.find(r => r.questionId === currentQuestion.id);
  const progressPercentage = ((currentQuestionIndex + 1) / PSYCHOMETRIC_QUESTIONS.length) * 100;

    const handleNext = async () => {
    if (!currentResponse) {
      showWebAlert('ANSWER REQUIRED', 'Please answer the current question before proceeding.');
      if (Platform.OS !== 'web') {
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      }
      return;
    }

    if (Platform.OS !== 'web') {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    }

    if (currentQuestionIndex === PSYCHOMETRIC_QUESTIONS.length - 1) {
      // Last question - submit test
      try {
        await submitTest();
        
        // Add a small delay before navigation on mobile
        setTimeout(() => {
          showWebAlert('TEST COMPLETED! 💪', 'Your psychometric profile has been analyzed. Welcome to your personalized wellness journey!');
          router.replace('/(tabs)');
        }, 500);
      } catch (error) {
        showWebAlert('SUBMISSION ERROR', 'Failed to submit test. Please try again.');
      }
    } else {
      nextQuestion();
    }
  };

  const handlePrevious = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    previousQuestion();
  };

  const handleQuestionResponse = (value: number | string) => {
    addResponse(currentQuestion.id, value);
  };

  const headerStyle = useAnimatedStyle(() => ({
    opacity: headerOpacity.value
  }));

  const progressStyle = useAnimatedStyle(() => ({
    opacity: progressOpacity.value
  }));

  const questionStyle = useAnimatedStyle(() => ({
    opacity: questionOpacity.value
  }));

  // Don't auto-redirect if completed - let user see completion message
  // if (isCompleted) {
  //   router.replace('/(tabs)');
  //   return null;
  // }

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[styles.content, { paddingTop: insets.top + 20 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <Animated.View style={[styles.header, headerStyle]}>
          <View style={styles.titleContainer}>
            <MaterialIcons name="psychology" size={scaleWidth(48)} color={NeoBrutalism.primary} />
            <Text style={styles.title}>PERSONALITY{'\n'}ASSESSMENT</Text>
          </View>
          <Text style={styles.subtitle}>
            HELP US UNDERSTAND YOUR MENTAL WARFARE PROFILE
          </Text>
        </Animated.View>

        {/* Progress */}
        <Animated.View style={[styles.progressSection, progressStyle]}>
          <View style={styles.progressHeader}>
            <Text style={styles.progressText}>
              QUESTION {currentQuestionIndex + 1} OF {PSYCHOMETRIC_QUESTIONS.length}
            </Text>
            <Text style={styles.progressPercentage}>
              {Math.round(progressPercentage)}%
            </Text>
          </View>
          
          <View style={styles.progressBarContainer}>
            <View style={styles.progressBar}>
              <View style={[
                styles.progressFill,
                { width: `${progressPercentage}%` }
              ]} />
            </View>
          </View>
        </Animated.View>

        {/* Question */}
        <Animated.View style={[styles.questionSection, questionStyle]}>
          <View style={styles.questionHeader}>
            <Text style={styles.questionText}>{currentQuestion.question_text}</Text>
          </View>

          <View style={styles.questionContent}>
            {currentQuestion.question_type === 'NUMBER_SLIDER' ? (
              <SliderQuestion
                question={currentQuestion}
                value={currentResponse?.value as number || currentQuestion.slider_range?.min || 0}
                onChange={(value) => handleQuestionResponse(value)}
              />
            ) : (
              <MCQQuestion
                question={currentQuestion}
                value={currentResponse?.value as string || ''}
                onChange={(value) => handleQuestionResponse(value)}
              />
            )}
          </View>
        </Animated.View>

        {/* Navigation */}
        <View style={styles.navigationSection}>
          <View style={styles.navigationButtons}>
            {currentQuestionIndex > 0 && (
              <AnimatedButton
                title="PREVIOUS"
                variant="secondary"
                size="medium"
                onPress={handlePrevious}
                style={styles.previousButton}
              />
            )}
            
            <AnimatedButton
              title={currentQuestionIndex === PSYCHOMETRIC_QUESTIONS.length - 1 ? "COMPLETE TEST" : "NEXT"}
              variant="primary"
              size="large"
              onPress={handleNext}
              disabled={isLoading}
              style={styles.nextButton}
            />
          </View>
        </View>

        <View style={styles.bottomSpacer} />
      </ScrollView>

      {/* Web Alert Modal */}
      {Platform.OS === 'web' && showAlert.visible && (
        <View style={styles.alertOverlay}>
          <View style={styles.alertContainer}>
            <Text style={styles.alertTitle}>{showAlert.title}</Text>
            <Text style={styles.alertMessage}>{showAlert.message}</Text>
            <AnimatedButton
              title="GOT IT!"
              onPress={() => setShowAlert({ visible: false, title: '', message: '' })}
              variant="primary"
              style={styles.alertButton}
            />
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: NeoBrutalism.background
  },
  scrollView: {
    flex: 1
  },
  content: {
    paddingHorizontal: getSpacing(16, 20, 24),
    paddingBottom: scaleHeight(100)
  },
  header: {
    alignItems: 'center',
    marginBottom: getSpacing(24, 28, 32)
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: getSpacing(12, 16, 20)
  },
  title: {
    fontSize: scaleFont(32),
    fontWeight: '900',
    color: NeoBrutalism.text,
    marginLeft: getSpacing(12, 16, 20),
    letterSpacing: 2,
    textShadowColor: NeoBrutalism.primary,
    textShadowOffset: { width: 3, height: 3 },
    textShadowRadius: 0,
    lineHeight: scaleFont(36)
  },
  subtitle: {
    fontSize: scaleFont(14),
    color: NeoBrutalism.textSecondary,
    textAlign: 'center',
    fontWeight: '700',
    letterSpacing: 1.5,
    lineHeight: scaleFont(18)
  },
  progressSection: {
    marginBottom: getSpacing(24, 28, 32)
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: getSpacing(12, 16, 20)
  },
  progressText: {
    fontSize: scaleFont(14),
    fontWeight: '900',
    color: NeoBrutalism.text,
    letterSpacing: 1
  },
  progressPercentage: {
    fontSize: scaleFont(16),
    fontWeight: '900',
    color: NeoBrutalism.primary,
    letterSpacing: 1
  },
  progressBarContainer: {
    backgroundColor: NeoBrutalism.surface,
    borderWidth: 4,
    borderColor: NeoBrutalism.void,
    height: scaleHeight(20),
    shadowColor: NeoBrutalism.void,
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 6
  },
  progressBar: {
    flex: 1,
    backgroundColor: NeoBrutalism.border,
    margin: 2
  },
  progressFill: {
    height: '100%',
    backgroundColor: NeoBrutalism.primary,
    borderWidth: 0
  },
  questionSection: {
    marginBottom: getSpacing(32, 40, 48)
  },
  questionHeader: {
    backgroundColor: NeoBrutalism.surface,
    borderWidth: 4,
    borderColor: NeoBrutalism.void,
    padding: getSpacing(20, 24, 28),
    marginBottom: getSpacing(20, 24, 28),
    shadowColor: NeoBrutalism.void,
    shadowOffset: { width: 6, height: 6 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 8
  },
  questionText: {
    fontSize: scaleFont(20),
    fontWeight: '900',
    color: NeoBrutalism.text,
    lineHeight: scaleFont(26),
    letterSpacing: 1,
    textAlign: 'center'
  },
  questionContent: {
    minHeight: scaleHeight(200)
  },
  navigationSection: {
    marginTop: getSpacing(20, 24, 28)
  },
  navigationButtons: {
    flexDirection: 'row',
    gap: getSpacing(12, 16, 20),
    alignItems: 'center'
  },
  previousButton: {
    flex: 1
  },
  nextButton: {
    flex: 2
  },
  bottomSpacer: {
    height: scaleHeight(40)
  },
  alertOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000
  },
  alertContainer: {
    backgroundColor: NeoBrutalism.surface,
    padding: getSpacing(20, 24, 28),
    borderRadius: 0,
    minWidth: scaleWidth(300),
    maxWidth: '90%',
    borderWidth: 4,
    borderColor: NeoBrutalism.void,
    shadowColor: NeoBrutalism.void,
    shadowOffset: { width: 8, height: 8 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 12
  },
  alertTitle: {
    fontSize: scaleFont(20),
    fontWeight: '900',
    color: NeoBrutalism.text,
    marginBottom: getSpacing(12, 16, 20),
    textAlign: 'center',
    letterSpacing: 1.5
  },
  alertMessage: {
    fontSize: scaleFont(16),
    color: NeoBrutalism.textSecondary,
    marginBottom: getSpacing(20, 24, 28),
    textAlign: 'center',
    lineHeight: scaleFont(22),
    fontWeight: '600'
  },
  alertButton: {
    width: '100%'
  }
});