import { MaterialIcons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import React from 'react';
import { Platform } from 'react-native';

import { HapticTab } from '@/components/HapticTab';
import TabBarBackground from '@/components/ui/TabBarBackground';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';

export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarBackground: TabBarBackground,
        tabBarStyle: Platform.select({
          ios: {
            // Use a transparent background on iOS to show the blur effect
            position: 'absolute',
          },
          default: {},
        }),
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Çantam',
          tabBarIcon: ({ color }) => <MaterialIcons size={28} name="backpack" color={color} />,
        }}
      />
      <Tabs.Screen
        name="explore"
        options={{
          title: 'Kategoriler',
          tabBarIcon: ({ color }) => <MaterialIcons size={28} name="grid-view" color={color} />,
        }}
      />
      <Tabs.Screen
        name="notifications"
        options={{
          title: 'Uyarılar',
          tabBarIcon: ({ color }) => <MaterialIcons size={28} name="notifications" color={color} />,
        }}
      />
    </Tabs>
  );
}
