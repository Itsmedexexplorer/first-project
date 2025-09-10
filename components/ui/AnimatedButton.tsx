import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withSpring, 
  withSequence,
  runOnJS
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { NeoBrutalism } from '@/constants/Colors';

interface AnimatedButtonProps {
  onPress: () => void;
  title: string;
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'success';
  size?: 'small' | 'medium' | 'large';
  disabled?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

export default function AnimatedButton({
  onPress,
  title,
  variant = 'primary',
  size = 'medium',
  disabled = false,
  style,
  textStyle
}: AnimatedButtonProps) {
  const scale = useSharedValue(1);
  const shadowOffset = useSharedValue(6);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    shadowOffset: {
      width: shadowOffset.value,
      height: shadowOffset.value
    }
  }));

  const handlePressIn = () => {
    runOnJS(Haptics.impactAsync)(Haptics.ImpactFeedbackStyle.Heavy);
    scale.value = withSpring(0.95, { damping: 10, stiffness: 400 });
    shadowOffset.value = withSpring(2, { damping: 10, stiffness: 400 });
  };

  const handlePressOut = () => {
    scale.value = withSequence(
      withSpring(1.02, { damping: 8, stiffness: 400 }),
      withSpring(1, { damping: 8, stiffness: 400 })
    );
    shadowOffset.value = withSpring(6, { damping: 8, stiffness: 400 });
  };

  const getButtonStyle = (): ViewStyle => {
    const baseStyle: ViewStyle = {
      ...styles.button,
      ...styles[size]
    };
    
    let variantStyle: ViewStyle = {};
    
    if (variant === 'primary') {
      variantStyle = styles.primary;
    } else if (variant === 'secondary') {
      variantStyle = styles.secondary;
    } else if (variant === 'danger') {
      variantStyle = styles.danger;
    } else if (variant === 'success') {
      variantStyle = styles.success;
    } else {
      variantStyle = styles.ghost;
    }
    
    let disabledStyle: ViewStyle = {};
    if (disabled) {
      disabledStyle = styles.disabled;
    }
    
    return {
      ...baseStyle,
      ...variantStyle,
      ...disabledStyle,
      ...style
    };
  };

  const getTextStyle = (): TextStyle => {
    const baseTextStyle: TextStyle = {
      ...styles.text,
      ...styles[`${size}Text` as keyof typeof styles]
    };
    
    let variantTextStyle: TextStyle = {};
    if (variant === 'ghost') {
      variantTextStyle = styles.ghostText;
    } else {
      variantTextStyle = styles.solidText;
    }
    
    return {
      ...baseTextStyle,
      ...variantTextStyle,
      ...textStyle
    };
  };

  return (
    <AnimatedTouchable
      style={[getButtonStyle(), animatedStyle]}
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={disabled}
      activeOpacity={0.8}
    >
      <Text style={getTextStyle()}>{title.toUpperCase()}</Text>
    </AnimatedTouchable>
  );
}

const styles = StyleSheet.create({
  button: {
    borderRadius: 0,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 4,
    borderColor: NeoBrutalism.void,
    shadowColor: NeoBrutalism.void,
    shadowOffset: { width: 6, height: 6 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 8
  },
  small: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    minHeight: 44,
    borderWidth: 3
  },
  medium: {
    paddingHorizontal: 28,
    paddingVertical: 16,
    minHeight: 56,
    borderWidth: 4
  },
  large: {
    paddingHorizontal: 36,
    paddingVertical: 20,
    minHeight: 64,
    borderWidth: 5
  },
  primary: {
    backgroundColor: NeoBrutalism.primary,
  },
  secondary: {
    backgroundColor: NeoBrutalism.secondary,
  },
  danger: {
    backgroundColor: NeoBrutalism.error,
  },
  success: {
    backgroundColor: NeoBrutalism.success,
  },
  ghost: {
    backgroundColor: 'transparent',
    borderColor: NeoBrutalism.primary
  },
  disabled: {
    opacity: 0.5,
    shadowOpacity: 0.3
  },
  text: {
    fontWeight: '900',
    textAlign: 'center',
    letterSpacing: 1.5
  },
  smallText: {
    fontSize: 14
  },
  mediumText: {
    fontSize: 16
  },
  largeText: {
    fontSize: 20
  },
  solidText: {
    color: NeoBrutalism.void,
    textShadowColor: 'rgba(255,255,255,0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 0
  },
  ghostText: {
    color: NeoBrutalism.primary,
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 0
  }
});