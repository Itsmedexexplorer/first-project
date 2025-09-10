import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Platform, Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { useMood } from '@/hooks/useMood';
import { useAuth } from '@/hooks/useAuth';
import { NeoBrutalism } from '@/constants/Colors';
import { scaleWidth, scaleHeight, scaleFont, getSpacing } from '@/utils/responsive';
import AnimatedButton from '@/components/ui/AnimatedButton';
import PrivacySettingsModal from '@/components/PrivacySettingsModal';
import SOSModal from '@/components/SOSModal';
import { DataExportService } from '@/services/dataExportService';

const achievements = [
  { id: 1, title: 'FIRST STEPS', description: 'COMPLETED FIRST MOOD CHECK-IN', icon: 'star', earned: true },
  { id: 2, title: 'WEEK WARRIOR', description: '7 DAY STREAK', icon: 'whatshot', earned: true },
  { id: 3, title: 'SELF AWARE', description: '30 MOOD ENTRIES', icon: 'psychology', earned: false },
  { id: 4, title: 'MINDFUL MASTER', description: '10 MEDITATION SESSIONS', icon: 'self-improvement', earned: false }
];

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const { currentStreak, moods } = useMood();
  const { user, logout } = useAuth();
  
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);
  const [showSOSModal, setShowSOSModal] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);

  const getWeeklyStats = () => {
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    const weeklyMoods = moods.filter(mood => mood.timestamp >= weekAgo);
    
    const avgIntensity = weeklyMoods.length > 0 
      ? weeklyMoods.reduce((sum, mood) => sum + mood.intensity, 0) / weeklyMoods.length
      : 0;
    
    return {
      entries: weeklyMoods.length,
      averageIntensity: Math.round(avgIntensity * 10) / 10
    };
  };

  const weeklyStats = getWeeklyStats();

  const handleLogout = async () => {
    try {
      await logout();
                        router.push('/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const handleNotifications = async () => {
    const newValue = !notificationsEnabled;
    setNotificationsEnabled(newValue);
    await AsyncStorage.setItem('notifications_enabled', newValue.toString());
    
    const message = newValue 
      ? 'Notifications have been enabled. You\'ll receive daily wellness reminders.' 
      : 'Notifications have been disabled. You can re-enable them anytime.';
    
    showAlert('Notifications Updated', message);
  };

  const handlePrivacySettings = () => {
    setShowPrivacyModal(true);
  };

  const handleDataExport = async () => {
    try {
      showAlert('Exporting Data', 'Preparing your wellness report...');
      await DataExportService.exportUserData();
      showAlert('Export Complete', 'Your wellness report has been downloaded successfully!');
    } catch (error) {
      showAlert('Export Failed', 'Unable to export data. Please try again.');
    }
  };

  const handleSOS = () => {
    setShowSOSModal(true);
  };

  const handleClearData = () => {
    Alert.alert(
      'CLEAR ALL DATA',
      'This will permanently delete ALL your mood entries, conversations, and personal data. This action CANNOT be undone.\n\nAre you absolutely sure?',
      [
        { text: 'CANCEL', style: 'cancel' },
        {
          text: 'DELETE EVERYTHING',
          style: 'destructive',
          onPress: confirmClearData
        }
      ]
    );
  };

  const confirmClearData = async () => {
    try {
      // Clear all stored data
      await AsyncStorage.multiRemove([
        'moods',
        'ai_messages',
        'user',
        'notifications_enabled'
      ]);
      
      showAlert('Data Cleared', 'All your data has been permanently deleted. You can start fresh or log in with a different account.');
      
      // Redirect to login
      setTimeout(() => {
        router.replace('/login');
      }, 2000);
    } catch (error) {
      showAlert('Error', 'Failed to clear data. Please try again.');
    }
  };

  const showAlert = (title: string, message: string) => {
    if (Platform.OS === 'web') {
      alert(`${title}: ${message}`);
    } else {
      Alert.alert(title, message);
    }
  };

  const settingsOptions = [
    { 
      title: 'NOTIFICATIONS', 
      icon: 'notifications', 
      value: notificationsEnabled ? 'ON' : 'OFF',
      onPress: handleNotifications
    },
    { 
      title: 'PRIVACY SETTINGS', 
      icon: 'security', 
      value: '',
      onPress: handlePrivacySettings
    },
    { 
      title: 'DATA EXPORT', 
      icon: 'download', 
      value: '',
      onPress: handleDataExport
    },
    { 
      title: 'SOS', 
      icon: 'sos', 
      value: '',
      onPress: handleSOS
    }
  ];

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[styles.content, { paddingTop: insets.top + 20 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Profile Header */}
        <View style={styles.header}>
          <View style={styles.avatarContainer}>
            <View style={styles.avatar}>
              <MaterialIcons name="person" size={scaleWidth(48)} color={NeoBrutalism.void} />
            </View>
          </View>
          
          <Text style={styles.name}>WELCOME BACK{user?.isGuest ? ' GUEST' : ''}!</Text>
          <Text style={styles.subtitle}>
            {user?.isGuest ? 'GUEST MODE ACTIVE' : 'YOUR WELLNESS WARFARE CONTINUES'}
          </Text>
        </View>

        {/* Stats Cards */}
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <MaterialIcons name="whatshot" size={scaleWidth(32)} color={NeoBrutalism.primary} />
            <Text style={styles.statNumber}>{currentStreak}</Text>
            <Text style={styles.statLabel}>DAY STREAK</Text>
          </View>
          
          <View style={styles.statCard}>
            <MaterialIcons name="mood" size={scaleWidth(32)} color={NeoBrutalism.secondary} />
            <Text style={styles.statNumber}>{weeklyStats.entries}</Text>
            <Text style={styles.statLabel}>THIS WEEK</Text>
          </View>
          
          <View style={styles.statCard}>
            <MaterialIcons name="trending-up" size={scaleWidth(32)} color={NeoBrutalism.success} />
            <Text style={styles.statNumber}>{weeklyStats.averageIntensity}</Text>
            <Text style={styles.statLabel}>AVG MOOD</Text>
          </View>
        </View>

        {/* Achievements */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>ACHIEVEMENTS</Text>
          <View style={styles.achievementsGrid}>
            {achievements.map((achievement) => (
              <View key={achievement.id} style={[
                styles.achievementCard,
                achievement.earned && styles.achievementCardEarned
              ]}>
                <MaterialIcons 
                  name={achievement.icon as any} 
                  size={scaleWidth(28)} 
                  color={achievement.earned ? NeoBrutalism.void : NeoBrutalism.textSecondary} 
                />
                <Text style={[
                  styles.achievementTitle,
                  achievement.earned && styles.achievementTitleEarned
                ]}>
                  {achievement.title}
                </Text>
                <Text style={[
                  styles.achievementDescription,
                  achievement.earned && styles.achievementDescriptionEarned
                ]}>
                  {achievement.description}
                </Text>
              </View>
            ))}
          </View>
        </View>

        {/* Settings */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>SETTINGS</Text>
          {settingsOptions.map((option, index) => (
            <TouchableOpacity 
              key={index} 
              style={styles.settingItem}
              onPress={option.onPress}
            >
              <MaterialIcons 
                name={option.icon as any} 
                size={scaleWidth(28)} 
                color={option.title === 'SOS' ? NeoBrutalism.error : NeoBrutalism.primary} 
              />
              <Text style={styles.settingTitle}>{option.title}</Text>
              <View style={styles.settingRight}>
                {option.value ? (
                  <Text style={[
                    styles.settingValue,
                    option.title === 'NOTIFICATIONS' && option.value === 'ON' && { color: NeoBrutalism.success }
                  ]}>
                    {option.value}
                  </Text>
                ) : null}
                <MaterialIcons name="chevron-right" size={scaleWidth(28)} color={NeoBrutalism.textSecondary} />
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Actions */}
        <View style={styles.section}>
          <AnimatedButton
            title="EXPORT MY DATA"
            variant="secondary"
            size="large"
            onPress={handleDataExport}
            style={styles.actionButton}
          />
          
          <AnimatedButton
            title="CLEAR ALL DATA"
            variant="danger"
            size="medium"
            onPress={handleClearData}
            style={styles.actionButton}
          />
          
          <AnimatedButton
            title={user?.isGuest ? "EXIT GUEST MODE" : "LOGOUT"}
            variant="secondary"
            size="medium"
            onPress={handleLogout}
            style={styles.actionButton}
          />
        </View>
      </ScrollView>

      {/* Modals */}
      <PrivacySettingsModal 
        visible={showPrivacyModal} 
        onClose={() => setShowPrivacyModal(false)} 
      />
      
      <SOSModal 
        visible={showSOSModal} 
        onClose={() => setShowSOSModal(false)} 
      />
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
  avatarContainer: {
    marginBottom: getSpacing(12, 16, 20)
  },
  avatar: {
    width: scaleWidth(80),
    height: scaleWidth(80),
    borderRadius: 0,
    backgroundColor: NeoBrutalism.primary,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 4,
    borderColor: NeoBrutalism.void,
    shadowColor: NeoBrutalism.void,
    shadowOffset: { width: 6, height: 6 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 10
  },
  name: {
    fontSize: scaleFont(24),
    fontWeight: '900',
    color: NeoBrutalism.text,
    marginBottom: getSpacing(6, 8, 10),
    letterSpacing: 2,
    textShadowColor: NeoBrutalism.primary,
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 0,
    textAlign: 'center'
  },
  subtitle: {
    fontSize: scaleFont(14),
    color: NeoBrutalism.textSecondary,
    fontWeight: '700',
    letterSpacing: 1,
    textAlign: 'center'
  },
  statsContainer: {
    flexDirection: 'row',
    gap: getSpacing(8, 10, 12),
    marginBottom: getSpacing(24, 28, 32)
  },
  statCard: {
    flex: 1,
    backgroundColor: NeoBrutalism.surface,
    padding: getSpacing(16, 18, 20),
    alignItems: 'center',
    borderRadius: 0,
    borderWidth: 4,
    borderColor: NeoBrutalism.void,
    shadowColor: NeoBrutalism.void,
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 8,
    minHeight: scaleHeight(100)
  },
  statNumber: {
    fontSize: scaleFont(20),
    fontWeight: '900',
    color: NeoBrutalism.text,
    marginTop: getSpacing(6, 8, 10),
    marginBottom: getSpacing(2, 3, 4),
    letterSpacing: 1
  },
  statLabel: {
    fontSize: scaleFont(10),
    color: NeoBrutalism.textSecondary,
    textAlign: 'center',
    fontWeight: '700',
    letterSpacing: 1
  },
  section: {
    marginBottom: getSpacing(24, 28, 32)
  },
  sectionTitle: {
    fontSize: scaleFont(18),
    fontWeight: '900',
    color: NeoBrutalism.text,
    marginBottom: getSpacing(12, 16, 20),
    letterSpacing: 1.5,
    textShadowColor: 'rgba(255,107,53,0.3)',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 0
  },
  achievementsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: getSpacing(8, 10, 12),
    justifyContent: 'space-between'
  },
  achievementCard: {
    width: `${(100 - 2) / 2}%`,
    backgroundColor: NeoBrutalism.surface,
    padding: getSpacing(12, 16, 20),
    alignItems: 'center',
    borderRadius: 0,
    borderWidth: 3,
    borderColor: NeoBrutalism.border,
    shadowColor: NeoBrutalism.void,
    shadowOffset: { width: 3, height: 3 },
    shadowOpacity: 0.5,
    shadowRadius: 0,
    elevation: 4,
    minHeight: scaleHeight(110),
    justifyContent: 'center',
    marginBottom: getSpacing(8, 10, 12)
  },
  achievementCardEarned: {
    backgroundColor: NeoBrutalism.primary,
    borderColor: NeoBrutalism.void,
    shadowOpacity: 1
  },
  achievementTitle: {
    fontSize: scaleFont(12),
    fontWeight: '900',
    color: NeoBrutalism.textSecondary,
    marginTop: getSpacing(6, 8, 10),
    marginBottom: getSpacing(2, 3, 4),
    textAlign: 'center',
    letterSpacing: 1
  },
  achievementTitleEarned: {
    color: NeoBrutalism.void
  },
  achievementDescription: {
    fontSize: scaleFont(9),
    color: NeoBrutalism.textSecondary,
    textAlign: 'center',
    fontWeight: '700',
    letterSpacing: 0.5,
    lineHeight: scaleFont(12)
  },
  achievementDescriptionEarned: {
    color: NeoBrutalism.void
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: NeoBrutalism.surface,
    padding: getSpacing(14, 16, 18),
    marginBottom: getSpacing(10, 12, 14),
    borderRadius: 0,
    borderWidth: 3,
    borderColor: NeoBrutalism.border,
    shadowColor: NeoBrutalism.void,
    shadowOffset: { width: 3, height: 3 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 6,
    minHeight: scaleHeight(60)
  },
  settingTitle: {
    fontSize: scaleFont(14),
    fontWeight: '900',
    color: NeoBrutalism.text,
    marginLeft: getSpacing(12, 14, 16),
    flex: 1,
    letterSpacing: 1
  },
  settingRight: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  settingValue: {
    fontSize: scaleFont(12),
    color: NeoBrutalism.textSecondary,
    marginRight: getSpacing(6, 8, 10),
    fontWeight: '700'
  },
  actionButton: {
    marginBottom: getSpacing(10, 12, 14)
  }
});