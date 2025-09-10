import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { NeoBrutalism } from '@/constants/Colors';
import { PsychometricQuestion } from '@/types/psychometric';
import { scaleFont, scaleHeight, scaleWidth, getSpacing } from '@/utils/responsive';

interface MCQQuestionProps {
  question: PsychometricQuestion;
  value: string;
  onChange: (value: string) => void;
}

export default function MCQQuestion({ question, value, onChange }: MCQQuestionProps) {
  const handleOptionSelect = async (optionValue: string) => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    onChange(optionValue);
  };

  return (
    <View style={styles.container}>
      {/* Options */}
      <View style={styles.optionsContainer}>
        {question.options?.map((option, index) => (
          <TouchableOpacity
            key={option.value}
            style={[
              styles.optionButton,
              value === option.value && styles.optionButtonSelected
            ]}
            onPress={() => handleOptionSelect(option.value)}
            activeOpacity={0.8}
          >
            <View style={styles.optionContent}>
              <View style={[
                styles.optionIndicator,
                value === option.value && styles.optionIndicatorSelected
              ]}>
                {value === option.value && (
                  <MaterialIcons 
                    name="check" 
                    size={scaleWidth(20)} 
                    color={NeoBrutalism.void} 
                  />
                )}
              </View>
              
              <Text style={[
                styles.optionText,
                value === option.value && styles.optionTextSelected
              ]}>
                {option.text}
              </Text>
            </View>
          </TouchableOpacity>
        ))}
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
  optionsContainer: {
    gap: getSpacing(12, 16, 20)
  },
  optionButton: {
    backgroundColor: NeoBrutalism.surface,
    borderWidth: 4,
    borderColor: NeoBrutalism.border,
    padding: getSpacing(16, 20, 24),
    shadowColor: NeoBrutalism.void,
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 0,
    elevation: 4,
    minHeight: scaleHeight(60)
  },
  optionButtonSelected: {
    backgroundColor: NeoBrutalism.primary,
    borderColor: NeoBrutalism.void,
    shadowOpacity: 1,
    shadowOffset: { width: 6, height: 6 },
    elevation: 8
  },
  optionContent: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  optionIndicator: {
    width: scaleWidth(28),
    height: scaleWidth(28),
    borderWidth: 3,
    borderColor: NeoBrutalism.border,
    backgroundColor: NeoBrutalism.background,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: getSpacing(12, 16, 20)
  },
  optionIndicatorSelected: {
    backgroundColor: NeoBrutalism.success,
    borderColor: NeoBrutalism.void
  },
  optionText: {
    fontSize: scaleFont(16),
    fontWeight: '700',
    color: NeoBrutalism.text,
    flex: 1,
    letterSpacing: 0.5,
    lineHeight: scaleFont(22)
  },
  optionTextSelected: {
    color: NeoBrutalism.void,
    fontWeight: '900'
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