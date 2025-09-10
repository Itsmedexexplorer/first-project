import React, { useEffect } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withRepeat,
  withSequence,
  interpolateColor,
  Easing
} from 'react-native-reanimated';
import { MoodType } from '@/types';
import { MoodColors, NeoBrutalism } from '@/constants/Colors';

interface MoodOrbProps {
  mood: MoodType;
  intensity: number;
  isAnalyzing?: boolean;
}

const { width } = Dimensions.get('window');
const ORB_SIZE = width * 0.35;

export default function MoodOrb({ mood, intensity, isAnalyzing = false }: MoodOrbProps) {
  const scale = useSharedValue(1);
  const rotation = useSharedValue(0);
  const rippleScale = useSharedValue(0);
  const shadowOffset = useSharedValue(12);
  const borderPulse = useSharedValue(6);

  useEffect(() => {
    if (isAnalyzing) {
      // Aggressive pulsing during analysis
      scale.value = withRepeat(
        withSequence(
          withSpring(1.15, { damping: 6 }),
          withSpring(1, { damping: 6 })
        ),
        -1,
        true
      );
      
      // Border pulse effect
      borderPulse.value = withRepeat(
        withSequence(
          withSpring(10, { damping: 8 }),
          withSpring(6, { damping: 8 })
        ),
        -1,
        true
      );
      
      // Harsh ripple effect
      rippleScale.value = withRepeat(
        withSequence(
          withSpring(0),
          withSpring(2.5, { damping: 4 })
        ),
        -1,
        false
      );
    } else {
      scale.value = withSpring(1);
      borderPulse.value = withSpring(6);
      rippleScale.value = withSpring(0);
    }
  }, [isAnalyzing]);

  useEffect(() => {
    // Shadow intensity based on mood intensity
    const targetShadow = 8 + (intensity / 10) * 12;
    shadowOffset.value = withSpring(targetShadow);
  }, [intensity]);

  const orbStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    shadowOffset: {
      width: shadowOffset.value,
      height: shadowOffset.value
    }
  }));

  const borderStyle = useAnimatedStyle(() => ({
    borderWidth: borderPulse.value
  }));

  const rippleStyle = useAnimatedStyle(() => ({
    transform: [{ scale: rippleScale.value }],
    opacity: Math.max(0, 1 - rippleScale.value / 2.5)
  }));

  const getMoodColor = () => {
    return MoodColors[mood];
  };

  return (
    <View style={styles.container}>
      {/* Harsh Ripple Effect */}
      {isAnalyzing && (
        <Animated.View style={[styles.ripple, rippleStyle]}>
          <View style={[styles.rippleBox, { backgroundColor: getMoodColor() + '40' }]} />
        </Animated.View>
      )}
      
      {/* Main Geometric Orb */}
      <Animated.View style={[styles.orb, orbStyle]}>
        <Animated.View style={[
          styles.orbInner, 
          borderStyle,
          { 
            backgroundColor: getMoodColor(),
            borderColor: NeoBrutalism.void 
          }
        ]}>
          {/* Harsh highlight */}
          <View style={styles.highlight} />
          
          {/* Geometric pattern overlay */}
          <View style={styles.pattern}>
            <View style={[styles.patternLine, styles.line1]} />
            <View style={[styles.patternLine, styles.line2]} />
            <View style={[styles.patternLine, styles.line3]} />
          </View>
        </Animated.View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: ORB_SIZE * 2,
    height: ORB_SIZE * 2,
    alignItems: 'center',
    justifyContent: 'center'
  },
  orb: {
    width: ORB_SIZE,
    height: ORB_SIZE,
    shadowColor: NeoBrutalism.void,
    shadowOffset: { width: 12, height: 12 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 15
  },
  orbInner: {
    width: ORB_SIZE,
    height: ORB_SIZE,
    borderRadius: 0,
    borderWidth: 6,
    borderColor: NeoBrutalism.void,
    overflow: 'hidden',
    position: 'relative'
  },
  highlight: {
    position: 'absolute',
    top: 8,
    left: 8,
    width: 40,
    height: 40,
    backgroundColor: 'rgba(255,255,255,0.8)',
    borderRadius: 0
  },
  pattern: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center'
  },
  patternLine: {
    backgroundColor: 'rgba(0,0,0,0.2)',
    position: 'absolute'
  },
  line1: {
    width: 80,
    height: 4,
    transform: [{ rotate: '45deg' }]
  },
  line2: {
    width: 80,
    height: 4,
    transform: [{ rotate: '-45deg' }]
  },
  line3: {
    width: 4,
    height: 80
  },
  ripple: {
    position: 'absolute',
    width: ORB_SIZE,
    height: ORB_SIZE,
    alignItems: 'center',
    justifyContent: 'center'
  },
  rippleBox: {
    width: ORB_SIZE,
    height: ORB_SIZE,
    borderRadius: 0,
    borderWidth: 4,
    borderColor: NeoBrutalism.void
  }
});