import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, ScrollView, Platform, KeyboardAvoidingView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withDelay
} from 'react-native-reanimated';

import { useAuth } from '@/hooks/useAuth';
import { NeoBrutalism } from '@/constants/Colors';
import AnimatedButton from '@/components/ui/AnimatedButton';

export default function LoginScreen() {
  const insets = useSafeAreaInsets();
  const { login, signUp, loginAsGuest, isLoading } = useAuth();
  
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [showAlert, setShowAlert] = useState({ visible: false, title: '', message: '' });

  const logoOpacity = useSharedValue(0);
  const formOpacity = useSharedValue(0);

  React.useEffect(() => {
    logoOpacity.value = withSpring(1, { damping: 8 });
    formOpacity.value = withDelay(300, withSpring(1, { damping: 8 }));
  }, []);

  const showWebAlert = (title: string, message: string) => {
    if (Platform.OS === 'web') {
      setShowAlert({ visible: true, title, message });
    } else {
      console.log(`${title}: ${message}`);
    }
  };

  const checkPsychometricStatus = async () => {
    try {
      const completed = await AsyncStorage.getItem('psychometric_completed');
      return completed === 'true';
    } catch (error) {
      console.error('Error checking psychometric status:', error);
      return false;
    }
  };

  const handleLogin = async () => {
    try {
      setError('');
      await login(email, password);
      
      // Check if psychometric test is completed
      const psychometricCompleted = await checkPsychometricStatus();
      if (psychometricCompleted) {
        router.replace('/(tabs)');
      } else {
        router.replace('/psychometric');
      }
    } catch (err) {
      setError('Invalid credentials. Try test@example.com / 123456');
    }
  };

  const handleSignUp = async () => {
    try {
      setError('');
      if (!name.trim()) {
        setError('Name is required');
        return;
      }
      await signUp(email, password, name);
      
      // Check if psychometric test is completed
      const psychometricCompleted = await checkPsychometricStatus();
      if (psychometricCompleted) {
        router.replace('/(tabs)');
      } else {
        router.replace('/psychometric');
      }
    } catch (err) {
      setError('Failed to create account');
    }
  };

  const handleGuestLogin = async () => {
    try {
      await loginAsGuest();
      showWebAlert('GUEST MODE ACTIVATED! 🎯', 'You are using the app as a guest. Your data will be stored locally on this device only.');
      
      // Check if psychometric test is completed
      const psychometricCompleted = await checkPsychometricStatus();
      if (psychometricCompleted) {
        router.replace('/(tabs)');
      } else {
        router.replace('/psychometric');
      }
    } catch (err) {
      setError('Failed to login as guest');
    }
  };

  const logoStyle = useAnimatedStyle(() => ({
    opacity: logoOpacity.value
  }));

  const formStyle = useAnimatedStyle(() => ({
    opacity: formOpacity.value
  }));

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={[styles.content, { paddingTop: insets.top + 40 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Logo Section */}
        <Animated.View style={[styles.logoSection, logoStyle]}>
          <View style={styles.logoContainer}>
            <MaterialIcons name="psychology" size={80} color={NeoBrutalism.primary} />
            <View style={styles.logoGlow} />
          </View>
          <Text style={styles.appTitle}>ULTIMATE AI{'\n'}WELLNESS</Text>
          <Text style={styles.appSubtitle}>MENTAL WARFARE TOOLKIT</Text>
        </Animated.View>

        {/* Form Section */}
        <Animated.View style={[styles.formSection, formStyle]}>
          <View style={styles.tabContainer}>
            <AnimatedButton
              title="LOGIN"
              variant={!isSignUp ? 'primary' : 'ghost'}
              size="medium"
              onPress={() => setIsSignUp(false)}
              style={styles.tabButton}
            />
            <AnimatedButton
              title="SIGN UP"
              variant={isSignUp ? 'primary' : 'ghost'}
              size="medium"
              onPress={() => setIsSignUp(true)}
              style={styles.tabButton}
            />
          </View>

          {error ? (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          ) : null}

          <View style={styles.inputContainer}>
            {isSignUp && (
              <View style={styles.inputWrapper}>
                <Text style={styles.inputLabel}>NAME</Text>
                <TextInput
                  style={styles.input}
                  placeholder="YOUR WARRIOR NAME"
                  placeholderTextColor={NeoBrutalism.textSecondary}
                  value={name}
                  onChangeText={setName}
                  autoCapitalize="words"
                />
              </View>
            )}

            <View style={styles.inputWrapper}>
              <Text style={styles.inputLabel}>EMAIL</Text>
              <TextInput
                style={styles.input}
                placeholder="test@example.com"
                placeholderTextColor={NeoBrutalism.textSecondary}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>

            <View style={styles.inputWrapper}>
              <Text style={styles.inputLabel}>PASSWORD</Text>
              <TextInput
                style={styles.input}
                placeholder="123456"
                placeholderTextColor={NeoBrutalism.textSecondary}
                value={password}
                onChangeText={setPassword}
                secureTextEntry
              />
            </View>
          </View>

          <View style={styles.buttonContainer}>
            <AnimatedButton
              title={isSignUp ? "CREATE ACCOUNT" : "LOGIN"}
              variant="primary"
              size="large"
              onPress={isSignUp ? handleSignUp : handleLogin}
              disabled={isLoading}
              style={styles.primaryButton}
            />

            <View style={styles.divider}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>OR</Text>
              <View style={styles.dividerLine} />
            </View>

            <AnimatedButton
              title="CONTINUE AS GUEST"
              variant="secondary"
              size="large"
              onPress={handleGuestLogin}
              disabled={isLoading}
              style={styles.guestButton}
            />
          </View>

          <View style={styles.credentialsHint}>
            <Text style={styles.hintText}>
              💡 Demo Credentials: test@example.com / 123456
            </Text>
          </View>
        </Animated.View>
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
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: NeoBrutalism.background
  },
  content: {
    paddingHorizontal: 24,
    paddingBottom: 40
  },
  logoSection: {
    alignItems: 'center',
    marginBottom: 60
  },
  logoContainer: {
    position: 'relative',
    marginBottom: 32
  },
  logoGlow: {
    position: 'absolute',
    top: -12,
    left: -12,
    right: -12,
    bottom: -12,
    backgroundColor: NeoBrutalism.electric,
    borderRadius: 0,
    opacity: 0.3,
    zIndex: -1
  },
  appTitle: {
    fontSize: 36,
    fontWeight: '900',
    color: NeoBrutalism.text,
    textAlign: 'center',
    marginBottom: 16,
    letterSpacing: 2,
    textShadowColor: NeoBrutalism.primary,
    textShadowOffset: { width: 4, height: 4 },
    textShadowRadius: 0,
    lineHeight: 42
  },
  appSubtitle: {
    fontSize: 16,
    color: NeoBrutalism.textSecondary,
    textAlign: 'center',
    fontWeight: '700',
    letterSpacing: 2
  },
  formSection: {
    gap: 24
  },
  tabContainer: {
    flexDirection: 'row',
    gap: 12
  },
  tabButton: {
    flex: 1
  },
  errorContainer: {
    backgroundColor: NeoBrutalism.error,
    padding: 16,
    borderRadius: 0,
    borderWidth: 3,
    borderColor: NeoBrutalism.void,
    shadowColor: NeoBrutalism.void,
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 6
  },
  errorText: {
    color: NeoBrutalism.void,
    fontSize: 14,
    fontWeight: '900',
    textAlign: 'center',
    letterSpacing: 1
  },
  inputContainer: {
    gap: 20
  },
  inputWrapper: {
    gap: 8
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '900',
    color: NeoBrutalism.text,
    letterSpacing: 1.5
  },
  input: {
    backgroundColor: NeoBrutalism.surface,
    borderRadius: 0,
    padding: 16,
    fontSize: 16,
    color: NeoBrutalism.text,
    borderWidth: 4,
    borderColor: NeoBrutalism.border,
    shadowColor: NeoBrutalism.void,
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 6,
    fontWeight: '600'
  },
  buttonContainer: {
    gap: 20,
    marginTop: 12
  },
  primaryButton: {
    width: '100%'
  },
  guestButton: {
    width: '100%'
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16
  },
  dividerLine: {
    flex: 1,
    height: 3,
    backgroundColor: NeoBrutalism.border
  },
  dividerText: {
    fontSize: 14,
    fontWeight: '900',
    color: NeoBrutalism.textSecondary,
    letterSpacing: 1
  },
  credentialsHint: {
    backgroundColor: NeoBrutalism.surface,
    padding: 16,
    borderRadius: 0,
    borderWidth: 3,
    borderColor: NeoBrutalism.border,
    shadowColor: NeoBrutalism.void,
    shadowOffset: { width: 3, height: 3 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 4
  },
  hintText: {
    fontSize: 14,
    color: NeoBrutalism.textSecondary,
    textAlign: 'center',
    fontWeight: '600'
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
    fontSize: 20,
    fontWeight: '900',
    color: NeoBrutalism.text,
    marginBottom: 12,
    textAlign: 'center',
    letterSpacing: 1.5
  },
  alertMessage: {
    fontSize: 16,
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