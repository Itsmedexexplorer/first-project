import React from 'react';
import { Tabs } from 'expo-router';
import { Platform } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { NeoBrutalism } from '@/constants/Colors';

export default function TabLayout() {
  const insets = useSafeAreaInsets();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: NeoBrutalism.primary,
        tabBarInactiveTintColor: NeoBrutalism.textSecondary,
        headerShown: false,
        tabBarStyle: {
          backgroundColor: NeoBrutalism.surface,
          borderTopWidth: 4,
          borderTopColor: NeoBrutalism.void,
          elevation: 0,
          shadowOpacity: 0,
          height: Platform.select({
            ios: insets.bottom + 80,
            android: insets.bottom + 80,
            default: 80
          }),
          paddingTop: 16,
          paddingBottom: Platform.select({
            ios: insets.bottom + 16,
            android: insets.bottom + 16,
            default: 16
          }),
          paddingHorizontal: 20
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '900',
          marginTop: 4,
          letterSpacing: 1
        },
        tabBarIconStyle: {
          marginBottom: 0
        },
        tabBarItemStyle: {
          paddingVertical: 4
        }
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'MOOD',
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="mood" size={size + 4} color={color} />
          )
        }}
      />
      <Tabs.Screen
        name="companion"
        options={{
          title: 'COMPANION',
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="psychology" size={size + 4} color={color} />
          )
        }}
      />
      <Tabs.Screen
        name="library"
        options={{
          title: 'LIBRARY',
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="library-books" size={size + 4} color={color} />
          )
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'PROFILE',
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="person" size={size + 4} color={color} />
          )
        }}
      />
    </Tabs>
  );
}