/**
 * Tab Layout
 *
 * Main tab navigation for the app.
 * Uses paint daube icons for brand consistency.
 */

import { Tabs } from 'expo-router';
import type React from 'react';
import { Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  AgentIcon,
  ChatIcon,
  FolderIcon,
  HomeIcon,
  type IconColor,
  SettingsIcon,
} from '@/components/icons';

interface TabIconProps {
  Icon: React.FC<{ size?: number; color?: IconColor; turbulence?: number }>;
  label: string;
  focused: boolean;
}

function TabIcon({ Icon, label, focused }: TabIconProps) {
  return (
    <View className="items-center justify-center py-2">
      <View className={`mb-1 ${focused ? 'opacity-100' : 'opacity-50'}`}>
        <Icon size={24} color={focused ? 'coral' : 'warmGray'} turbulence={0.2} />
      </View>
      <Text
        className={`text-xs font-body ${focused ? 'text-coral-500 font-semibold' : 'text-neutral-400'}`}
      >
        {label}
      </Text>
    </View>
  );
}

export default function TabLayout() {
  const insets = useSafeAreaInsets();

  return (
    <Tabs
      screenOptions={{
        headerShown: true,
        headerStyle: {
          backgroundColor: '#151820',
        },
        headerTitleStyle: {
          fontFamily: 'Fraunces',
          color: '#fff',
        },
        headerTintColor: '#fff',
        tabBarStyle: {
          backgroundColor: '#1E293B',
          borderTopColor: '#334155',
          borderTopWidth: 1,
          height: 80 + insets.bottom,
          paddingBottom: insets.bottom,
        },
        tabBarActiveTintColor: '#FF7059',
        tabBarInactiveTintColor: '#9CA3AF',
        tabBarLabelStyle: {
          fontFamily: 'Cabin',
          fontSize: 11,
        },
        tabBarShowLabel: false,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          headerTitle: 'ThumbCode',
          tabBarIcon: ({ focused }) => <TabIcon Icon={HomeIcon} label="Home" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="projects"
        options={{
          title: 'Projects',
          tabBarIcon: ({ focused }) => (
            <TabIcon Icon={FolderIcon} label="Projects" focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="agents"
        options={{
          title: 'Agents',
          tabBarIcon: ({ focused }) => (
            <TabIcon Icon={AgentIcon} label="Agents" focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="chat"
        options={{
          title: 'Chat',
          tabBarIcon: ({ focused }) => <TabIcon Icon={ChatIcon} label="Chat" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Settings',
          tabBarIcon: ({ focused }) => (
            <TabIcon Icon={SettingsIcon} label="Settings" focused={focused} />
          ),
        }}
      />
    </Tabs>
  );
}
