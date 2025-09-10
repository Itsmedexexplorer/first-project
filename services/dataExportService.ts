import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { MoodEntry } from '@/types';

export class DataExportService {
  static async exportUserData(): Promise<void> {
    try {
      // Collect all user data
      const userData = await this.collectAllUserData();
      const report = this.generateDetailedReport(userData);
      
      if (Platform.OS === 'web') {
        this.downloadForWeb(report, 'wellness-report.json');
      } else {
        await this.shareForMobile(report);
      }
    } catch (error) {
      console.error('Error exporting data:', error);
      throw new Error('Failed to export data');
    }
  }

  private static async collectAllUserData() {
    const [
      user,
      moods,
      messages,
      onboardingStatus
    ] = await Promise.all([
      AsyncStorage.getItem('user'),
      AsyncStorage.getItem('moods'),
      AsyncStorage.getItem('ai_messages'),
      AsyncStorage.getItem('onboarding_completed')
    ]);

    return {
      user: user ? JSON.parse(user) : null,
      moods: moods ? JSON.parse(moods) : [],
      messages: messages ? JSON.parse(messages) : [],
      onboardingCompleted: onboardingStatus === 'true',
      exportDate: new Date().toISOString(),
      appVersion: '1.0.0'
    };
  }

  private static generateDetailedReport(userData: any) {
    const moods: MoodEntry[] = userData.moods;
    
    // Calculate analytics
    const analytics = this.calculateAnalytics(moods);
    
    return {
      exportInfo: {
        generatedAt: userData.exportDate,
        appVersion: userData.appVersion,
        userId: userData.user?.id || 'guest',
        userName: userData.user?.name || 'Guest User'
      },
      userProfile: {
        email: userData.user?.email || 'guest@example.com',
        name: userData.user?.name || 'Guest User',
        isGuest: userData.user?.isGuest || true,
        onboardingCompleted: userData.onboardingCompleted
      },
      moodData: {
        totalEntries: moods.length,
        dateRange: {
          first: moods.length > 0 ? moods[moods.length - 1].timestamp : null,
          last: moods.length > 0 ? moods[0].timestamp : null
        },
        entries: moods.map(mood => ({
          date: mood.timestamp,
          mood: mood.mood,
          intensity: mood.intensity,
          notes: mood.notes || '',
          tags: mood.tags || []
        }))
      },
      analytics: analytics,
      conversationData: {
        totalMessages: userData.messages.length,
        userMessages: userData.messages.filter((msg: any) => msg.isUser).length,
        aiResponses: userData.messages.filter((msg: any) => !msg.isUser).length,
        conversations: userData.messages.map((msg: any) => ({
          timestamp: msg.timestamp,
          isUser: msg.isUser,
          content: msg.content,
          emotion: msg.emotion || null
        }))
      },
      insights: this.generateInsights(moods, analytics),
      recommendations: this.generateRecommendations(analytics)
    };
  }

  private static calculateAnalytics(moods: MoodEntry[]) {
    if (moods.length === 0) {
      return {
        averageIntensity: 0,
        moodDistribution: {},
        streakData: { current: 0, longest: 0 },
        weeklyAverage: 0,
        monthlyTrends: []
      };
    }

    const intensities = moods.map(m => m.intensity);
    const averageIntensity = intensities.reduce((sum, i) => sum + i, 0) / intensities.length;

    const moodDistribution = moods.reduce((acc: any, mood) => {
      acc[mood.mood] = (acc[mood.mood] || 0) + 1;
      return acc;
    }, {});

    // Calculate streaks
    const streakData = this.calculateStreaks(moods);

    // Weekly trends
    const weeklyAverage = this.calculateWeeklyAverage(moods);

    return {
      averageIntensity: Math.round(averageIntensity * 100) / 100,
      moodDistribution,
      streakData,
      weeklyAverage: Math.round(weeklyAverage * 100) / 100,
      totalDays: moods.length,
      improvementTrend: this.calculateImprovementTrend(moods)
    };
  }

  private static calculateStreaks(moods: MoodEntry[]) {
    // Sort moods by date
    const sortedMoods = [...moods].sort((a, b) => 
      new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    );

    let currentStreak = 0;
    let longestStreak = 0;
    let tempStreak = 0;

    for (let i = 0; i < sortedMoods.length; i++) {
      if (i === 0) {
        tempStreak = 1;
      } else {
        const prevDate = new Date(sortedMoods[i - 1].timestamp);
        const currentDate = new Date(sortedMoods[i].timestamp);
        const dayDiff = (currentDate.getTime() - prevDate.getTime()) / (1000 * 60 * 60 * 24);

        if (dayDiff === 1) {
          tempStreak++;
        } else {
          longestStreak = Math.max(longestStreak, tempStreak);
          tempStreak = 1;
        }
      }
    }

    longestStreak = Math.max(longestStreak, tempStreak);
    currentStreak = tempStreak;

    return { current: currentStreak, longest: longestStreak };
  }

  private static calculateWeeklyAverage(moods: MoodEntry[]) {
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    
    const weeklyMoods = moods.filter(mood => 
      new Date(mood.timestamp) >= weekAgo
    );

    if (weeklyMoods.length === 0) return 0;

    const sum = weeklyMoods.reduce((acc, mood) => acc + mood.intensity, 0);
    return sum / weeklyMoods.length;
  }

  private static calculateImprovementTrend(moods: MoodEntry[]) {
    if (moods.length < 2) return 'insufficient_data';

    const sortedMoods = [...moods].sort((a, b) => 
      new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    );

    const firstHalf = sortedMoods.slice(0, Math.floor(sortedMoods.length / 2));
    const secondHalf = sortedMoods.slice(Math.floor(sortedMoods.length / 2));

    const firstHalfAvg = firstHalf.reduce((sum, mood) => sum + mood.intensity, 0) / firstHalf.length;
    const secondHalfAvg = secondHalf.reduce((sum, mood) => sum + mood.intensity, 0) / secondHalf.length;

    const improvement = secondHalfAvg - firstHalfAvg;

    if (improvement > 0.5) return 'improving';
    if (improvement < -0.5) return 'declining';
    return 'stable';
  }

  private static generateInsights(moods: MoodEntry[], analytics: any) {
    const insights = [];

    if (analytics.averageIntensity > 7) {
      insights.push('Your overall mood intensity is quite positive. Keep up the great work!');
    } else if (analytics.averageIntensity < 4) {
      insights.push('Your mood data shows some challenging periods. Consider reaching out for professional support.');
    }

    if (analytics.streakData.longest > 7) {
      insights.push(`Impressive! Your longest streak of consistent mood tracking was ${analytics.streakData.longest} days.`);
    }

    if (analytics.improvementTrend === 'improving') {
      insights.push('Your mood trends show positive improvement over time. Your wellness journey is progressing well.');
    } else if (analytics.improvementTrend === 'declining') {
      insights.push('Recent trends show some challenges. Consider implementing additional self-care strategies.');
    }

    return insights;
  }

  private static generateRecommendations(analytics: any) {
    const recommendations = [];

    if (analytics.averageIntensity < 5) {
      recommendations.push('Consider establishing a daily mindfulness practice');
      recommendations.push('Schedule regular check-ins with a mental health professional');
    }

    if (analytics.streakData.current < 3) {
      recommendations.push('Try setting daily reminders for mood tracking');
      recommendations.push('Establish a consistent morning or evening routine for check-ins');
    }

    recommendations.push('Continue your wellness journey with daily mood tracking');
    recommendations.push('Explore the guided meditation library for additional support');

    return recommendations;
  }

  private static downloadForWeb(data: any, filename: string) {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  private static async shareForMobile(data: any) {
    const filename = `wellness-report-${new Date().toISOString().split('T')[0]}.json`;
    const fileUri = `${FileSystem.documentDirectory}${filename}`;
    
    await FileSystem.writeAsStringAsync(fileUri, JSON.stringify(data, null, 2));
    
    if (await Sharing.isAvailableAsync()) {
      await Sharing.shareAsync(fileUri);
    } else {
      throw new Error('Sharing is not available on this device');
    }
  }
}