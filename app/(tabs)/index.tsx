import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, Alert, Platform, Dimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withDelay
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';

import { useMood } from '@/hooks/useMood';
import { MoodType } from '@/types';
import { NeoBrutalism, MoodColors } from '@/constants/Colors';
import MoodOrb from '@/components/ui/MoodOrb';
import AnimatedButton from '@/components/ui/AnimatedButton';
import { scaleWidth, scaleHeight, scaleFont, getSpacing } from '@/utils/responsive';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const moodOptions: { type: MoodType; label: string; icon: string }[] = [
  { type: 'excellent', label: 'EXCELLENT', icon: 'sentiment-very-satisfied' },
  { type: 'good', label: 'GOOD', icon: 'sentiment-satisfied' },
  { type: 'okay', label: 'OKAY', icon: 'sentiment-neutral' },
  { type: 'low', label: 'LOW', icon: 'sentiment-dissatisfied' },
  { type: 'terrible', label: 'TERRIBLE', icon: 'sentiment-very-dissatisfied' }
];

export default function MoodTrackingScreen() {
  const insets = useSafeAreaInsets();
  const { addMoodEntry, currentStreak, isLoading, moods } = useMood();
  
  const [selectedMood, setSelectedMood] = useState<MoodType>('okay');
  const [intensity, setIntensity] = useState(5);
  const [notes, setNotes] = useState('');
  const [showAlert, setShowAlert] = useState({ visible: false, title: '', message: '' });
  
  const headerOpacity = useSharedValue(0);
  const contentOpacity = useSharedValue(0);
  const orbScale = useSharedValue(0.8);

  useEffect(() => {
    // Aggressive animations
    headerOpacity.value = withSpring(1, { damping: 8 });
    contentOpacity.value = withDelay(150, withSpring(1, { damping: 8 }));
    orbScale.value = withDelay(300, withSpring(1, { damping: 6 }));
  }, []);

  const showWebAlert = (title: string, message: string) => {
    if (Platform.OS === 'web') {
      setShowAlert({ visible: true, title, message });
    } else {
      Alert.alert(title, message);
    }
  };

  const handleMoodSubmit = async () => {
    try {
      await addMoodEntry(selectedMood, intensity, notes);
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      
      showWebAlert(
        'MOOD LOCKED IN! 💥',
        `Your ${selectedMood.toUpperCase()} mood has been RECORDED. Keep crushing your wellness journey!`
      );
      
      setNotes('');
    } catch (error) {
      showWebAlert('ERROR', 'Failed to save mood entry. Try again.');
    }
  };

  const headerStyle = useAnimatedStyle(() => ({
    opacity: headerOpacity.value
  }));

  const contentStyle = useAnimatedStyle(() => ({
    opacity: contentOpacity.value
  }));

  const orbStyle = useAnimatedStyle(() => ({
    transform: [{ scale: orbScale.value }]
  }));

  const getTodaysMoodCount = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return moods.filter(mood => {
      const moodDate = new Date(mood.timestamp);
      moodDate.setHours(0, 0, 0, 0);
      return moodDate.getTime() === today.getTime();
    }).length;
  };

  // Responsive calculations
  const buttonWidth = SCREEN_WIDTH < 350 ? '45%' : SCREEN_WIDTH < 400 ? '48%' : '31%';
  const intensityButtonSize = scaleWidth(36);

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[styles.content, { paddingTop: insets.top + 20 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <Animated.View style={[styles.header, headerStyle]}>
          <Text style={styles.title}>HOW ARE YOU{'\n'}FEELING?</Text>
          <Text style={styles.subtitle}>
            TRACK YOUR EMOTIONAL WARFARE
          </Text>
          
          {/* Streak Counter */}
          <View style={styles.streakContainer}>
            <MaterialIcons name="whatshot" size={scaleWidth(32)} color={NeoBrutalism.primary} />
            <Text style={styles.streakText}>{currentStreak} DAY STREAK</Text>
            <Text style={styles.streakSubtext}>• {getTodaysMoodCount()} ENTRIES TODAY</Text>
          </View>
        </Animated.View>

        {/* Mood Orb */}
        <Animated.View style={[styles.orbContainer, orbStyle]}>
          <MoodOrb 
            mood={selectedMood} 
            intensity={intensity} 
            isAnalyzing={isLoading}
          />
        </Animated.View>

        {/* Content */}
        <Animated.View style={[styles.formContainer, contentStyle]}>
          {/* Mood Selection */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>SELECT YOUR MOOD</Text>
            <View style={styles.moodGrid}>
              {moodOptions.map((mood) => (
                <AnimatedButton
                  key={mood.type}
                  title={mood.label}
                  variant={selectedMood === mood.type ? 'primary' : 'ghost'}
                  size="small"
                  onPress={() => {
                    setSelectedMood(mood.type);
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
                  }}
                  style={[
                    { width: buttonWidth },
                    selectedMood === mood.type && {
                      backgroundColor: MoodColors[mood.type]
                    }
                  ]}
                />
              ))}
            </View>
          </View>

          {/* Intensity Selector */}
          <View style={styles.intensitySection}>
            <Text style={styles.sectionTitle}>
              INTENSITY: {intensity}/10
            </Text>
            <View style={styles.intensityContainer}>
              {[...Array(10)].map((_, index) => (
                <AnimatedButton
                  key={index}
                  title={(index + 1).toString()}
                  variant={intensity >= index + 1 ? 'primary' : 'ghost'}
                  size="small"
                  onPress={() => {
                    setIntensity(index + 1);
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
                  }}
                  style={[
                    styles.intensityButton,
                    intensity >= index + 1 && {
                      backgroundColor: MoodColors[selectedMood]
                    }
                  ]}
                />
              ))}
            </View>
          </View>

          {/* Notes */}
          <View style={styles.notesSection}>
            <Text style={styles.sectionTitle}>NOTES (OPTIONAL)</Text>
            <TextInput
              style={styles.notesInput}
              placeholder="What's on your mind? The AI will analyze your feelings..."
              placeholderTextColor={NeoBrutalism.textSecondary}
              multiline
              numberOfLines={4}
              value={notes}
              onChangeText={setNotes}
              textAlignVertical="top"
            />
          </View>

          {/* Submit Button */}
          <AnimatedButton
            title={isLoading ? "PROCESSING..." : "TRACK MY MOOD"}
            onPress={handleMoodSubmit}
            variant="primary"
            size="large"
            disabled={isLoading}
            style={[
              styles.submitButton,
              { backgroundColor: MoodColors[selectedMood] }
            ]}
          />
        </Animated.View>
      </ScrollView>

      {/* Web Alert Modal */}
      {Platform.OS === 'web' && showAlert.visible && (
        <View style={styles.alertOverlay}>
          <View style={styles.alertContainer}>
            <Text style={styles.alertTitle}>{showAlert.title}</Text>
            <Text style={styles.alertMessage}>{showAlert.message}</Text>
            <AnimatedButton
              title="OK"
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
    marginBottom: getSpacing(16, 20, 24)
  },
  title: {
    fontSize: scaleFont(28),
    fontWeight: '900',
    color: NeoBrutalism.text,
    textAlign: 'center',
    marginBottom: scaleHeight(12),
    letterSpacing: 2,
    textShadowColor: NeoBrutalism.primary,
    textShadowOffset: { width: 3, height: 3 },
    textShadowRadius: 0,
    lineHeight: scaleFont(34)
  },
  subtitle: {
    fontSize: scaleFont(14),
    color: NeoBrutalism.textSecondary,
    textAlign: 'center',
    marginBottom: scaleHeight(20),
    fontWeight: '700',
    letterSpacing: 1.5
  },
  streakContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: NeoBrutalism.surface,
    paddingHorizontal: getSpacing(16, 18, 20),
    paddingVertical: getSpacing(10, 12, 14),
    borderRadius: 0,
    borderWidth: 4,
    borderColor: NeoBrutalism.void,
    shadowColor: NeoBrutalism.void,
    shadowOffset: { width: 6, height: 6 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 8
  },
  streakText: {
    fontSize: scaleFont(14),
    fontWeight: '900',
    color: NeoBrutalism.primary,
    marginLeft: getSpacing(6, 8, 10),
    letterSpacing: 1
  },
  streakSubtext: {
    fontSize: scaleFont(10),
    color: NeoBrutalism.textSecondary,
    marginLeft: getSpacing(3, 4, 5),
    fontWeight: '700'
  },
  orbContainer: {
    alignItems: 'center',
    marginVertical: getSpacing(24, 32, 40)
  },
  formContainer: {
    gap: getSpacing(20, 24, 28)
  },
  section: {
    gap: getSpacing(12, 16, 20)
  },
  intensitySection: {
    marginTop: getSpacing(24, 32, 40),
    gap: getSpacing(12, 16, 20)
  },
  notesSection: {
    marginTop: getSpacing(24, 32, 40),
    gap: getSpacing(12, 16, 20)
  },
  sectionTitle: {
    fontSize: scaleFont(16),
    fontWeight: '900',
    color: NeoBrutalism.text,
    letterSpacing: 1.5,
    textShadowColor: 'rgba(255,107,53,0.3)',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 0
  },
  moodGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: getSpacing(8, 10, 12),
    justifyContent: 'space-between'
  },
  intensityContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    marginTop: getSpacing(8, 10, 12)
  },
  intensityButton: {
    width: scaleWidth(36),
    height: scaleWidth(36),
    marginRight: getSpacing(4, 6, 8),
    marginBottom: getSpacing(6, 8, 10)
  },
  notesInput: {
    backgroundColor: NeoBrutalism.surface,
    borderRadius: 0,
    padding: getSpacing(12, 16, 20),
    fontSize: scaleFont(14),
    color: NeoBrutalism.text,
    minHeight: scaleHeight(100),
    borderWidth: 4,
    borderColor: NeoBrutalism.border,
    shadowColor: NeoBrutalism.void,
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 6,
    fontWeight: '600'
  },
  submitButton: {
    marginTop: getSpacing(16, 20, 24),
    width: '100%'
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
    padding: 24,
    borderRadius: 0,
    minWidth: 300,
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
    fontSize: scaleFont(18),
    fontWeight: '900',
    color: NeoBrutalism.text,
    marginBottom: 12,
    textAlign: 'center',
    letterSpacing: 1.5
  },
  alertMessage: {
    fontSize: scaleFont(14),
    color: NeoBrutalism.textSecondary,
    marginBottom: 20,
    textAlign: 'center',
    lineHeight: 22,
    fontWeight: '600'
  },
  alertButton: {
    width: '100%'
  }
});