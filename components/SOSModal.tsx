import React from 'react';
import { View, Text, StyleSheet, Modal, Linking, Platform, Alert, ScrollView, TouchableOpacity } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';

import { NeoBrutalism } from '@/constants/Colors';
import AnimatedButton from '@/components/ui/AnimatedButton';

interface SOSModalProps {
  visible: boolean;
  onClose: () => void;
}

export default function SOSModal({ visible, onClose }: SOSModalProps) {
  const insets = useSafeAreaInsets();
  const emergencyContacts = [
    {
      title: 'CRISIS TEXT LINE',
      subtitle: 'Text HOME to 741741',
      action: () => handleTextCrisis(),
      icon: 'sms',
      color: NeoBrutalism.error
    },
    {
      title: 'SUICIDE HOTLINE',
      subtitle: 'Call 988',
      action: () => handleCallCrisis(),
      icon: 'phone',
      color: NeoBrutalism.error
    },
    {
      title: 'EMERGENCY SERVICES',
      subtitle: 'Call 911',
      action: () => handleCallEmergency(),
      icon: 'local-hospital',
      color: NeoBrutalism.warning
    },
    {
      title: 'MENTAL HEALTH AMERICA',
      subtitle: 'Find local resources',
      action: () => handleMentalHealthResources(),
      icon: 'psychology',
      color: NeoBrutalism.primary
    }
  ];

  const handleTextCrisis = async () => {
    try {
      if (Platform.OS !== 'web') {
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
      }
      const url = Platform.select({
        ios: 'sms:741741&body=HOME',
        android: 'sms:741741?body=HOME',
        default: 'sms:741741'
      });
      
      const canOpen = await Linking.canOpenURL(url!);
      if (canOpen) {
        await Linking.openURL(url!);
      } else {
        showAlert('Crisis Text Line', 'Text HOME to 741741 for immediate support');
      }
    } catch (error) {
      showAlert('Crisis Text Line', 'Text HOME to 741741 for immediate support');
    }
  };

  const handleCallCrisis = async () => {
    try {
      if (Platform.OS !== 'web') {
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
      }
      const url = 'tel:988';
      
      const canOpen = await Linking.canOpenURL(url);
      if (canOpen) {
        await Linking.openURL(url);
      } else {
        showAlert('Crisis Hotline', 'Call 988 for immediate crisis support');
      }
    } catch (error) {
      showAlert('Crisis Hotline', 'Call 988 for immediate crisis support');
    }
  };

  const handleCallEmergency = async () => {
    try {
      if (Platform.OS !== 'web') {
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
      }
      
      Alert.alert(
        'Emergency Services',
        'Are you experiencing a medical emergency?',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Call 911',
            style: 'destructive',
            onPress: async () => {
              const url = 'tel:911';
              const canOpen = await Linking.canOpenURL(url);
              if (canOpen) {
                await Linking.openURL(url);
              }
            }
          }
        ]
      );
    } catch (error) {
      showAlert('Emergency Services', 'Call 911 for medical emergencies');
    }
  };

  const handleMentalHealthResources = async () => {
    try {
      if (Platform.OS !== 'web') {
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }
      const url = 'https://www.mhanational.org/finding-help';
      
      const canOpen = await Linking.canOpenURL(url);
      if (canOpen) {
        await Linking.openURL(url);
      } else {
        showAlert('Mental Health Resources', 'Visit mhanational.org for local mental health resources');
      }
    } catch (error) {
      showAlert('Mental Health Resources', 'Visit mhanational.org for local mental health resources');
    }
  };

  const showAlert = (title: string, message: string) => {
    if (Platform.OS === 'web') {
      alert(`${title}: ${message}`);
    } else {
      Alert.alert(title, message);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.overlay}>
        <View style={[styles.container, { paddingTop: insets.top + 20 }]}>
          {/* Header with Close Button */}
          <View style={styles.header}>
            <View style={styles.headerTop}>
              <MaterialIcons name="sos" size={48} color={NeoBrutalism.error} />
              <TouchableOpacity
                style={styles.closeButton}
                onPress={onClose}
              >
                <Text style={styles.closeButtonText}>✕</Text>
              </TouchableOpacity>
            </View>
            <Text style={styles.title}>EMERGENCY SUPPORT</Text>
            <Text style={styles.subtitle}>IMMEDIATE HELP AVAILABLE 24/7</Text>
          </View>

          {/* Scrollable Content */}
          <ScrollView 
            style={styles.scrollContent}
            contentContainerStyle={styles.content}
            showsVerticalScrollIndicator={false}
            bounces={true}
          >
            {emergencyContacts.map((contact, index) => (
              <AnimatedButton
                key={index}
                title={`${contact.title}\n${contact.subtitle}`}
                onPress={contact.action}
                variant="primary"
                size="large"
                style={[
                  styles.emergencyButton,
                  { backgroundColor: contact.color }
                ]}
                textStyle={styles.emergencyButtonText}
              />
            ))}

            {/* Safety Message */}
            <View style={styles.safetyMessage}>
              <MaterialIcons name="favorite" size={24} color={NeoBrutalism.primary} />
              <Text style={styles.safetyText}>
                You are not alone. These feelings are temporary, but you are important and your life has value. 
                Reach out - help is available.
              </Text>
            </View>

            {/* Additional Resources */}
            <View style={styles.additionalResources}>
              <Text style={styles.resourceTitle}>ADDITIONAL RESOURCES</Text>
              <View style={styles.resourceItem}>
                <MaterialIcons name="web" size={20} color={NeoBrutalism.primary} />
                <Text style={styles.resourceText}>National Suicide Prevention Lifeline: 988lifeline.org</Text>
              </View>
              <View style={styles.resourceItem}>
                <MaterialIcons name="message" size={20} color={NeoBrutalism.primary} />
                <Text style={styles.resourceText}>Crisis Text Line: Text HOME to 741741</Text>
              </View>
              <View style={styles.resourceItem}>
                <MaterialIcons name="local_hospital" size={20} color={NeoBrutalism.primary} />
                <Text style={styles.resourceText}>Emergency Services: 911</Text>
              </View>
            </View>
          </ScrollView>

          {/* Footer with Close Button */}
          <View style={[styles.footer, { paddingBottom: insets.bottom + 20 }]}>
            <TouchableOpacity
              style={styles.footerButton}
              onPress={onClose}
            >
              <Text style={styles.footerButtonText}>I'M SAFE - CLOSE</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.9)',
    justifyContent: 'flex-end',
    paddingHorizontal: 0
  },
  container: {
    backgroundColor: NeoBrutalism.surface,
    borderRadius: 0,
    borderTopWidth: 6,
    borderLeftWidth: 6,
    borderRightWidth: 6,
    borderColor: NeoBrutalism.error,
    shadowColor: NeoBrutalism.error,
    shadowOffset: { width: 8, height: 8 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 12,
    width: '100%',
    maxHeight: '95%',
    flex: 1
  },
  header: {
    padding: 24,
    borderBottomWidth: 4,
    borderBottomColor: NeoBrutalism.error,
    backgroundColor: NeoBrutalism.surface
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16
  },
  closeButton: {
    width: 44,
    height: 44,
    backgroundColor: NeoBrutalism.surface,
    borderWidth: 3,
    borderColor: NeoBrutalism.border,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: NeoBrutalism.void,
    shadowOffset: { width: 3, height: 3 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 6
  },
  closeButtonText: {
    fontSize: 20,
    fontWeight: '900',
    color: NeoBrutalism.text,
    lineHeight: 20
  },
  scrollContent: {
    flex: 1
  },
  title: {
    fontSize: 28,
    fontWeight: '900',
    color: NeoBrutalism.error,
    letterSpacing: 2,
    textAlign: 'center',
    marginTop: 12,
    marginBottom: 8,
    textShadowColor: NeoBrutalism.void,
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 0
  },
  subtitle: {
    fontSize: 14,
    color: NeoBrutalism.textSecondary,
    textAlign: 'center',
    fontWeight: '700',
    letterSpacing: 1
  },
  content: {
    padding: 24,
    paddingBottom: 40
  },
  emergencyButton: {
    minHeight: 80,
    justifyContent: 'center'
  },
  emergencyButtonText: {
    fontSize: 16,
    lineHeight: 22,
    textAlign: 'center'
  },
  safetyMessage: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: NeoBrutalism.background,
    padding: 16,
    borderRadius: 0,
    borderWidth: 3,
    borderColor: NeoBrutalism.primary,
    marginTop: 16
  },
  safetyText: {
    flex: 1,
    fontSize: 14,
    color: NeoBrutalism.textSecondary,
    lineHeight: 20,
    marginLeft: 12,
    fontWeight: '600'
  },
  footer: {
    padding: 20,
    borderTopWidth: 4,
    borderTopColor: NeoBrutalism.error,
    backgroundColor: NeoBrutalism.surface
  },
  footerButton: {
    width: '100%',
    backgroundColor: NeoBrutalism.primary,
    borderWidth: 4,
    borderColor: NeoBrutalism.void,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: NeoBrutalism.void,
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 8
  },
  footerButtonText: {
    fontSize: 18,
    fontWeight: '900',
    color: NeoBrutalism.void,
    letterSpacing: 1.5
  },
  additionalResources: {
    marginTop: 24,
    backgroundColor: NeoBrutalism.background,
    padding: 20,
    borderWidth: 3,
    borderColor: NeoBrutalism.primary
  },
  resourceTitle: {
    fontSize: 16,
    fontWeight: '900',
    color: NeoBrutalism.primary,
    marginBottom: 16,
    letterSpacing: 1.5,
    textAlign: 'center'
  },
  resourceItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    paddingHorizontal: 8
  },
  resourceText: {
    fontSize: 13,
    color: NeoBrutalism.textSecondary,
    marginLeft: 12,
    flex: 1,
    fontWeight: '600',
    lineHeight: 18
  }
});