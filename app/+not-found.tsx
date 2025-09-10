import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Minimalist } from '@/constants/Colors';
import AnimatedButton from '@/components/ui/AnimatedButton';

export default function NotFoundScreen() {
  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[Minimalist.background, Minimalist.surface]}
        style={styles.background}
      />
      
      <View style={styles.content}>
        <MaterialIcons name="sentiment-dissatisfied" size={80} color={Minimalist.textSecondary} />
        <Text style={styles.title}>Page Not Found</Text>
        <Text style={styles.subtitle}>
          This screen doesn't exist in your wellness journey
        </Text>
        
        <AnimatedButton
          title="Go Back Home"
          onPress={() => router.replace('/(tabs)')}
          variant="primary"
          size="large"
          style={styles.button}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  background: {
    ...StyleSheet.absoluteFillObject
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: Minimalist.text,
    marginTop: 24,
    marginBottom: 12,
    textAlign: 'center'
  },
  subtitle: {
    fontSize: 16,
    color: Minimalist.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 40
  },
  button: {
    width: '100%'
  }
});