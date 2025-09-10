
import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, PanResponder, Dimensions } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { NeoBrutalism } from '@/constants/Colors';
import { PsychometricQuestion } from '@/types/psychometric';
import { scaleFont, scaleHeight, scaleWidth, getSpacing } from '@/utils/responsive';

interface SliderQuestionProps {
  question: PsychometricQuestion;
  value: number;
  onChange: (value: number) => void;
}

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function SliderQuestion({ question, value, onChange }: SliderQuestionProps) {
  const [currentValue, setCurrentValue] = useState(value || question.slider_range?.min || 0);

  const min = question.slider_range?.min || 0;
  const max = question.slider_range?.max || 10;
  const step = question.slider_range?.step || 1;

  const sliderWidth = SCREEN_WIDTH - getSpacing(80, 100, 120);
  const thumbSize = scaleWidth(40);

  const getThumbPosition = (val: number) => {
    const percentage = (val - min) / (max - min);
    return percentage * (sliderWidth - thumbSize);
  };

  const getValueFromPosition = (position: number) => {
    const percentage = position / (sliderWidth - thumbSize);
    const rawValue = min + percentage * (max - min);
    return Math.round(rawValue / step) * step;
  };

  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onMoveShouldSetPanResponder: () => true,
    onPanResponderMove: (evt, gestureState) => {
      const newPosition = Math.max(0, Math.min(sliderWidth - thumbSize, gestureState.moveX - getSpacing(40, 50, 60)));
      const newValue = Math.max(min, Math.min(max, getValueFromPosition(newPosition)));
      setCurrentValue(newValue);
      onChange(newValue);
    },
  });

  const handleStepButton = (increment: boolean) => {
    const newValue = increment 
      ? Math.min(max, currentValue + step)
      : Math.max(min, currentValue - step);
    setCurrentValue(newValue);
    onChange(newValue);
  };

  return (
    <View style={styles.container}>
      {/* Value Display */}
      <View style={styles.valueContainer}>
        <View style={styles.valueBox}>
          <Text style={styles.valueText}>{currentValue}</Text>
        </View>
        <View style={styles.rangeLabel}>
          <Text style={styles.rangeLabelText}>
            {min} → {max}
          </Text>
        </View>
      </View>

      {/* Step Buttons */}
      <View style={styles.stepButtons}>
        <TouchableOpacity 
          style={[styles.stepButton, currentValue <= min && styles.stepButtonDisabled]}
          onPress={() => handleStepButton(false)}
          disabled={currentValue <= min}
        >
          <MaterialIcons name="remove" size={scaleWidth(24)} color={currentValue <= min ? NeoBrutalism.textSecondary : NeoBrutalism.void} />
        </TouchableOpacity>

        <View style={styles.stepButtonSpacer} />

        <TouchableOpacity 
          style={[styles.stepButton, currentValue >= max && styles.stepButtonDisabled]}
          onPress={() => handleStepButton(true)}
          disabled={currentValue >= max}
        >
          <MaterialIcons name="add" size={scaleWidth(24)} color={currentValue >= max ? NeoBrutalism.textSecondary : NeoBrutalism.void} />
        </TouchableOpacity>
      </View>

      {/* Custom Slider */}
      <View style={styles.sliderContainer}>
        <View style={styles.sliderTrack}>
          <View 
            style={[
              styles.sliderFill, 
              { width: getThumbPosition(currentValue) + thumbSize / 2 }
            ]} 
          />
          <View
            style={[
              styles.sliderThumb,
              { left: getThumbPosition(currentValue) }
            ]}
            {...panResponder.panHandlers}
          >
            <View style={styles.thumbInner} />
          </View>
        </View>
      </View>

      {/* Scale Markers */}
      <View style={styles.markersContainer}>
        <View style={styles.marker}>
          <View style={styles.markerLine} />
          <Text style={styles.markerText}>{min}</Text>
        </View>
        
        {max > 5 && (
          <View style={styles.marker}>
            <View style={styles.markerLine} />
            <Text style={styles.markerText}>{Math.floor((min + max) / 2)}</Text>
          </View>
        )}
        
        <View style={styles.marker}>
          <View style={styles.markerLine} />
          <Text style={styles.markerText}>{max}</Text>
        </View>
      </View>

      {/* Hint */}
      {question.hint && (
        <View style={styles.hintContainer}>
          <MaterialIcons name="info" size={scaleWidth(16)} color={NeoBrutalism.textSecondary} />
          <Text style={styles.hintText}>{question.hint}</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: getSpacing(16, 20, 24)
  },
  valueContainer: {
    alignItems: 'center',
    marginBottom: getSpacing(20, 24, 28)
  },
  valueBox: {
    backgroundColor: NeoBrutalism.primary,
    borderWidth: 4,
    borderColor: NeoBrutalism.void,
    paddingHorizontal: getSpacing(20, 24, 28),
    paddingVertical: getSpacing(12, 16, 20),
    marginBottom: getSpacing(8, 10, 12),
    shadowColor: NeoBrutalism.void,
    shadowOffset: { width: 6, height: 6 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 8
  },
  valueText: {
    fontSize: scaleFont(28),
    fontWeight: '900',
    color: NeoBrutalism.void,
    letterSpacing: 2,
    textAlign: 'center'
  },
  rangeLabel: {
    backgroundColor: NeoBrutalism.surface,
    borderWidth: 3,
    borderColor: NeoBrutalism.border,
    paddingHorizontal: getSpacing(12, 16, 20),
    paddingVertical: getSpacing(6, 8, 10)
  },
  rangeLabelText: {
    fontSize: scaleFont(12),
    fontWeight: '700',
    color: NeoBrutalism.textSecondary,
    letterSpacing: 1
  },
  stepButtons: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: getSpacing(20, 24, 28)
  },
  stepButton: {
    backgroundColor: NeoBrutalism.primary,
    borderWidth: 4,
    borderColor: NeoBrutalism.void,
    width: scaleWidth(50),
    height: scaleWidth(50),
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: NeoBrutalism.void,
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 6
  },
  stepButtonDisabled: {
    backgroundColor: NeoBrutalism.border,
    borderColor: NeoBrutalism.textSecondary,
    shadowOpacity: 0.3
  },
  stepButtonSpacer: {
    width: getSpacing(60, 80, 100)
  },
  sliderContainer: {
    marginVertical: getSpacing(16, 20, 24),
    alignItems: 'center'
  },
  sliderTrack: {
    width: SCREEN_WIDTH - getSpacing(80, 100, 120),
    height: scaleHeight(20),
    backgroundColor: NeoBrutalism.surface,
    borderWidth: 4,
    borderColor: NeoBrutalism.void,
    position: 'relative',
    shadowColor: NeoBrutalism.void,
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 6
  },
  sliderFill: {
    height: '100%',
    backgroundColor: NeoBrutalism.primary,
    position: 'absolute',
    top: 0,
    left: 0
  },
  sliderThumb: {
    position: 'absolute',
    top: -scaleHeight(10),
    width: scaleWidth(40),
    height: scaleHeight(40),
    backgroundColor: NeoBrutalism.primary,
    borderWidth: 4,
    borderColor: NeoBrutalism.void,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: NeoBrutalism.void,
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 8
  },
  thumbInner: {
    width: scaleWidth(16),
    height: scaleHeight(16),
    backgroundColor: NeoBrutalism.void,
    borderRadius: 0
  },
  markersContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: getSpacing(12, 16, 20),
    marginHorizontal: getSpacing(8, 12, 16)
  },
  marker: {
    alignItems: 'center'
  },
  markerLine: {
    width: 3,
    height: scaleHeight(12),
    backgroundColor: NeoBrutalism.border,
    marginBottom: getSpacing(4, 6, 8)
  },
  markerText: {
    fontSize: scaleFont(10),
    fontWeight: '900',
    color: NeoBrutalism.textSecondary,
    letterSpacing: 1
  },
  hintContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: NeoBrutalism.background,
    borderWidth: 3,
    borderColor: NeoBrutalism.border,
    padding: getSpacing(12, 16, 20),
    marginTop: getSpacing(16, 20, 24)
  },
  hintText: {
    fontSize: scaleFont(12),
    color: NeoBrutalism.textSecondary,
    marginLeft: getSpacing(8, 10, 12),
    flex: 1,
    lineHeight: scaleFont(16),
    fontWeight: '600'
  }
});
