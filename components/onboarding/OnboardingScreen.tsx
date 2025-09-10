import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Dimensions, StatusBar } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withDelay,
  withSequence,
  runOnJS
} from 'react-native-reanimated';
import { router } from 'expo-router';
import { NeoBrutalism } from '@/constants/Colors';
import AnimatedButton from '@/components/ui/AnimatedButton';

const { width, height } = Dimensions.get('window');

const onboardingSteps = [
  {
    title: "TRACK YOUR\nMOOD",
    subtitle: "AI-POWERED EMOTIONAL WARFARE",
    description: "Advanced algorithms analyze your voice, expressions, and journal entries to provide BRUTAL emotional insights.",
    color: NeoBrutalism.primary
  },
  {
    title: "AI COMPANION\nSUPPORT", 
    subtitle: "24/7 CONVERSATIONAL THERAPY",
    description: "Your personal AI therapist provides RELENTLESS support and evidence-based therapeutic interventions.",
    color: NeoBrutalism.secondary
  },
  {
    title: "PERSONALIZED\nWELLNESS",
    subtitle: "TAILORED MENTAL HEALTH JOURNEY",
    description: "Custom therapy modules, crisis intervention, and progress tracking designed to DOMINATE your wellness goals.",
    color: NeoBrutalism.accent
  }
];

export default function OnboardingScreen({ onComplete }: { onComplete: () => void }) {
  const [currentStep, setCurrentStep] = useState(0);
  const insets = useSafeAreaInsets();
  
  const titleOpacity = useSharedValue(0);
  const titleTranslateY = useSharedValue(80);
  const subtitleOpacity = useSharedValue(0);
  const descriptionOpacity = useSharedValue(0);
  const buttonOpacity = useSharedValue(0);
  const backgroundScale = useSharedValue(1);

  useEffect(() => {
    animateIn();
  }, [currentStep]);

  const animateIn = () => {
    titleOpacity.value = 0;
    titleTranslateY.value = 80;
    subtitleOpacity.value = 0;
    descriptionOpacity.value = 0;
    buttonOpacity.value = 0;
    
    titleOpacity.value = withSpring(1, { damping: 8 });
    titleTranslateY.value = withSpring(0, { damping: 8 });
    subtitleOpacity.value = withDelay(150, withSpring(1, { damping: 8 }));
    descriptionOpacity.value = withDelay(300, withSpring(1, { damping: 8 }));
    buttonOpacity.value = withDelay(450, withSpring(1, { damping: 8 }));
  };

  const handleNext = () => {
    if (currentStep < onboardingSteps.length - 1) {
      backgroundScale.value = withSequence(
        withSpring(1.05, { damping: 6 }),
        withSpring(1, { damping: 6 })
      );
      setCurrentStep(currentStep + 1);
    } else {
      // Animate out and complete onboarding
      titleOpacity.value = withSpring(0, { damping: 6 });
      subtitleOpacity.value = withSpring(0, { damping: 6 });
      descriptionOpacity.value = withSpring(0, { damping: 6 });
      buttonOpacity.value =         withSpring(0, { damping: 6 }, (finished) => {
          if (finished) {
            runOnJS(onComplete)();
          }
        });
    }
  };

  const titleStyle = useAnimatedStyle(() => ({
    opacity: titleOpacity.value,
    transform: [{ translateY: titleTranslateY.value }]
  }));

  const subtitleStyle = useAnimatedStyle(() => ({
    opacity: subtitleOpacity.value
  }));

  const descriptionStyle = useAnimatedStyle(() => ({
    opacity: descriptionOpacity.value
  }));

  const buttonStyle = useAnimatedStyle(() => ({
    opacity: buttonOpacity.value
  }));

  const backgroundStyle = useAnimatedStyle(() => ({
    transform: [{ scale: backgroundScale.value }]
  }));

  const currentStepData = onboardingSteps[currentStep];

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={NeoBrutalism.background} />
      
      <Animated.View style={[styles.background, backgroundStyle]}>
        <View style={[styles.colorBlock, { backgroundColor: currentStepData.color }]} />
        <View style={styles.pattern}>
          <View style={[styles.patternLine, styles.line1]} />
          <View style={[styles.patternLine, styles.line2]} />
          <View style={[styles.patternLine, styles.line3]} />
        </View>
      </Animated.View>

      <View style={[styles.content, { paddingTop: insets.top + 60 }]}>
        {/* Progress indicator */}
        <View style={styles.progressContainer}>
          {onboardingSteps.map((_, index) => (
            <View
              key={index}
              style={[
                styles.progressDot,
                {
                  backgroundColor: index === currentStep 
                    ? currentStepData.color 
                    : NeoBrutalism.border,
                  width: index === currentStep ? 50 : 16,
                  borderColor: NeoBrutalism.void,
                  borderWidth: 3
                }
              ]}
            />
          ))}
        </View>

        <View style={styles.textContent}>
          <Animated.Text style={[styles.title, titleStyle]}>
            {currentStepData.title}
          </Animated.Text>
          
          <Animated.Text style={[styles.subtitle, subtitleStyle]}>
            {currentStepData.subtitle}
          </Animated.Text>
          
          <Animated.Text style={[styles.description, descriptionStyle]}>
            {currentStepData.description}
          </Animated.Text>
        </View>

        <Animated.View style={[styles.buttonContainer, buttonStyle]}>
          <AnimatedButton
            title={currentStep === onboardingSteps.length - 1 ? "START YOUR JOURNEY" : "NEXT"}
            onPress={handleNext}
            variant="primary"
            size="large"
            style={{
              backgroundColor: currentStepData.color,
              width: width - 60,
              marginBottom: insets.bottom + 40
            }}
          />
        </Animated.View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: NeoBrutalism.background
  },
  background: {
    ...StyleSheet.absoluteFillObject
  },
  colorBlock: {
    position: 'absolute',
    top: '20%',
    right: '-10%',
    width: '60%',
    height: '40%',
    transform: [{ rotate: '15deg' }],
    opacity: 0.2
  },
  pattern: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center'
  },
  patternLine: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    position: 'absolute'
  },
  line1: {
    width: width * 1.5,
    height: 8,
    transform: [{ rotate: '45deg' }]
  },
  line2: {
    width: width * 1.5,
    height: 8,
    transform: [{ rotate: '-45deg' }]
  },
  line3: {
    width: 8,
    height: height,
    left: '30%'
  },
  content: {
    flex: 1,
    paddingHorizontal: 30
  },
  progressContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 60
  },
  progressDot: {
    height: 16,
    borderRadius: 0,
    marginHorizontal: 6,
    shadowColor: NeoBrutalism.void,
    shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 4
  },
  textContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  title: {
    fontSize: 48,
    fontWeight: '900',
    color: NeoBrutalism.text,
    textAlign: 'center',
    lineHeight: 52,
    letterSpacing: -1,
    marginBottom: 24,
    textShadowColor: NeoBrutalism.primary,
    textShadowOffset: { width: 4, height: 4 },
    textShadowRadius: 0
  },
  subtitle: {
    fontSize: 18,
    fontWeight: '900',
    color: NeoBrutalism.textSecondary,
    textAlign: 'center',
    marginBottom: 32,
    textTransform: 'uppercase',
    letterSpacing: 2,
    textShadowColor: 'rgba(0,0,0,0.8)',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 0
  },
  description: {
    fontSize: 16,
    color: NeoBrutalism.textSecondary,
    textAlign: 'center',
    lineHeight: 26,
    paddingHorizontal: 20,
    fontWeight: '600',
    letterSpacing: 0.5
  },
  buttonContainer: {
    alignItems: 'center'
  }
});