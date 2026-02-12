/**
 * Tab Layout
 *
 * Main tab navigation for the app.
 * Uses paint daube icons for brand consistency.
 */

import { Tabs } from 'expo-router';
import type React from 'react';
import {
  AgentIcon,
  ChatIcon,
  FolderIcon,
  HomeIcon,
  type IconColor,
  SettingsIcon,
} from '@/components/icons';
import { getColor } from '@/utils/design-tokens';

interface TabIconProps {
  Icon: React.FC<{ size?: number; color?: IconColor; turbulence?: number }>;
  label: string;
  focused: boolean;
}

function TabIcon({ Icon, label, focused }: Readonly<TabIconProps>) {
  return (
    <div className="items-center justify-center py-2">
      <div className={`mb-1 ${focused ? 'opacity-100' : 'opacity-50'}`}>
        <Icon size={24} color={focused ? 'coral' : 'warmGray'} turbulence={0.2} />
      </div>
      <Text
        className={`text-xs font-body ${focused ? 'text-coral-500 font-semibold' : 'text-neutral-400'}`}
      >
        {label}
      </Text>
    </div>
  );
}

export default function TabLayout() {

  return (
    <Tabs
      screenOptions={{
        headerShown: true,
        headerStyle: {
          backgroundColor: getColor('charcoal'),
        },
        headerTitleStyle: {
          fontFamily: 'Fraunces',
          color: getColor('neutral', '50'),
        },
        headerTintColor: getColor('neutral', '50'),
        tabBarStyle: {
          backgroundColor: getColor('neutral', '800'),
          borderTopColor: getColor('neutral', '700'),
          borderTopWidth: 1,
          height: 80,
          paddingBottom: 16,
        },
        tabBarActiveTintColor: getColor('coral', '500'),
        tabBarInactiveTintColor: getColor('neutral', '400'),
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
