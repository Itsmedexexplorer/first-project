import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { NeoBrutalism } from '@/constants/Colors';

const contentCategories = [
  {
    id: 'meditation',
    title: 'GUIDED MEDITATIONS',
    icon: 'self-improvement',
    color: NeoBrutalism.primary,
    items: [
      { title: 'MORNING MINDFULNESS', duration: '10 MIN', emoji: '🧘‍♀️' },
      { title: 'STRESS DESTRUCTION', duration: '15 MIN', emoji: '🌿' },
      { title: 'SLEEP DOMINATION', duration: '20 MIN', emoji: '🌙' }
    ]
  },
  {
    id: 'breathing',
    title: 'BREATHING EXERCISES',
    icon: 'air',
    color: NeoBrutalism.success,
    items: [
      { title: '4-7-8 TECHNIQUE', duration: '5 MIN', emoji: '💨' },
      { title: 'BOX BREATHING', duration: '8 MIN', emoji: '📦' },
      { title: 'CALM BREATHING', duration: '12 MIN', emoji: '🌊' }
    ]
  },
  {
    id: 'articles',
    title: 'EDUCATIONAL ARSENAL',
    icon: 'article',
    color: NeoBrutalism.warning,
    items: [
      { title: 'UNDERSTANDING ANXIETY', duration: '5 MIN READ', emoji: '📚' },
      { title: 'BUILDING RESILIENCE', duration: '7 MIN READ', emoji: '💪' },
      { title: 'HEALTHY HABITS', duration: '4 MIN READ', emoji: '✨' }
    ]
  }
];

export default function LibraryScreen() {
  const insets = useSafeAreaInsets();
  const [selectedCategory, setSelectedCategory] = useState('meditation');

  const currentCategory = contentCategories.find(cat => cat.id === selectedCategory);

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[styles.content, { paddingTop: insets.top + 20 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>WELLNESS{'\n'}LIBRARY</Text>
          <Text style={styles.subtitle}>
            CURATED CONTENT FOR MENTAL WARFARE
          </Text>
        </View>

        {/* Category Tabs */}
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoriesContainer}
        >
          {contentCategories.map((category) => (
            <TouchableOpacity
              key={category.id}
              style={[
                styles.categoryTab,
                selectedCategory === category.id && {
                  backgroundColor: category.color
                }
              ]}
              onPress={() => setSelectedCategory(category.id)}
            >
              <MaterialIcons 
                name={category.icon as any} 
                size={24} 
                color={selectedCategory === category.id ? NeoBrutalism.void : NeoBrutalism.textSecondary} 
              />
              <Text style={[
                styles.categoryText,
                selectedCategory === category.id && styles.categoryTextActive
              ]}>
                {category.title}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Content Items */}
        <View style={styles.contentSection}>
          <Text style={styles.sectionTitle}>{currentCategory?.title}</Text>
          
          {currentCategory?.items.map((item, index) => (
                        <TouchableOpacity 
              key={index} 
              style={styles.contentCard}
              onPress={() => console.log(`Starting: ${item.title}`)}
            >
              <View style={styles.cardContent}>
                <View style={styles.cardIcon}>
                  <Text style={styles.cardEmoji}>{item.emoji}</Text>
                </View>
                
                <View style={styles.cardInfo}>
                  <Text style={styles.cardTitle}>{item.title}</Text>
                  <Text style={styles.cardDuration}>{item.duration}</Text>
                </View>
                
                <TouchableOpacity 
                  style={[styles.playButton, { backgroundColor: currentCategory.color }]}
                  onPress={() => console.log(`Playing: ${item.title}`)}
                >
                  <MaterialIcons name="play-arrow" size={28} color={NeoBrutalism.void} />
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Recently Viewed */}
        <View style={styles.contentSection}>
          <Text style={styles.sectionTitle}>RECENTLY VIEWED</Text>
          
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.recentGrid}>
              {[1, 2, 3].map((item) => (
                <TouchableOpacity 
                  key={item} 
                  style={styles.recentCard}
                  onPress={() => console.log(`Resuming session ${item}`)}
                >
                  <View style={styles.recentCardContent}>
                    <MaterialIcons name="play-circle-filled" size={40} color={NeoBrutalism.primary} />
                  </View>
                  <Text style={styles.recentCardTitle}>SESSION {item}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
        </View>
      </ScrollView>
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
    paddingHorizontal: 24,
    paddingBottom: 100
  },
  header: {
    alignItems: 'center',
    marginBottom: 32
  },
  title: {
    fontSize: 32,
    fontWeight: '900',
    color: NeoBrutalism.text,
    textAlign: 'center',
    marginBottom: 12,
    letterSpacing: 2,
    textShadowColor: NeoBrutalism.primary,
    textShadowOffset: { width: 3, height: 3 },
    textShadowRadius: 0,
    lineHeight: 38
  },
  subtitle: {
    fontSize: 16,
    color: NeoBrutalism.textSecondary,
    textAlign: 'center',
    fontWeight: '700',
    letterSpacing: 1.5
  },
  categoriesContainer: {
    paddingHorizontal: 4,
    marginBottom: 32
  },
  categoryTab: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: NeoBrutalism.surface,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 0,
    marginRight: 12,
    borderWidth: 3,
    borderColor: NeoBrutalism.border,
    shadowColor: NeoBrutalism.void,
    shadowOffset: { width: 3, height: 3 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 6
  },
  categoryText: {
    fontSize: 12,
    fontWeight: '900',
    color: NeoBrutalism.textSecondary,
    marginLeft: 8,
    letterSpacing: 1
  },
  categoryTextActive: {
    color: NeoBrutalism.void
  },
  contentSection: {
    marginBottom: 32
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: NeoBrutalism.text,
    marginBottom: 16,
    letterSpacing: 1.5,
    textShadowColor: 'rgba(255,107,53,0.3)',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 0
  },
  contentCard: {
    marginBottom: 16,
    borderRadius: 0,
    backgroundColor: NeoBrutalism.surface,
    borderWidth: 4,
    borderColor: NeoBrutalism.void,
    shadowColor: NeoBrutalism.void,
    shadowOffset: { width: 6, height: 6 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 8
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20
  },
  cardIcon: {
    width: 60,
    height: 60,
    borderRadius: 0,
    backgroundColor: NeoBrutalism.background,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
    borderWidth: 3,
    borderColor: NeoBrutalism.border
  },
  cardEmoji: {
    fontSize: 28
  },
  cardInfo: {
    flex: 1
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: NeoBrutalism.text,
    marginBottom: 4,
    letterSpacing: 1
  },
  cardDuration: {
    fontSize: 14,
    color: NeoBrutalism.textSecondary,
    fontWeight: '700'
  },
  playButton: {
    width: 56,
    height: 56,
    borderRadius: 0,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: NeoBrutalism.void,
    shadowColor: NeoBrutalism.void,
    shadowOffset: { width: 3, height: 3 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 6
  },
  recentGrid: {
    flexDirection: 'row',
    gap: 16
  },
  recentCard: {
    alignItems: 'center',
    width: 120
  },
  recentCardContent: {
    width: 100,
    height: 100,
    borderRadius: 0,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
    backgroundColor: NeoBrutalism.surface,
    borderWidth: 4,
    borderColor: NeoBrutalism.void,
    shadowColor: NeoBrutalism.void,
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 6
  },
  recentCardTitle: {
    fontSize: 12,
    fontWeight: '900',
    color: NeoBrutalism.text,
    textAlign: 'center',
    letterSpacing: 1
  }
});