/**
 * Tab Layout
 *
 * Main tab navigation for the app.
 */

import { Tabs } from 'expo-router';
import { Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface TabIconProps {
  icon: string;
  label: string;
  focused: boolean;
}

function TabIcon({ icon, label, focused }: TabIconProps) {
  return (
    <View className="items-center justify-center py-2">
      <Text className={`text-xl mb-1 ${focused ? 'opacity-100' : 'opacity-50'}`}>{icon}</Text>
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
          tabBarIcon: ({ focused }) => <TabIcon icon="🏠" label="Home" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="projects"
        options={{
          title: 'Projects',
          tabBarIcon: ({ focused }) => <TabIcon icon="📁" label="Projects" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="agents"
        options={{
          title: 'Agents',
          tabBarIcon: ({ focused }) => <TabIcon icon="🤖" label="Agents" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="chat"
        options={{
          title: 'Chat',
          tabBarIcon: ({ focused }) => <TabIcon icon="💬" label="Chat" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Settings',
          tabBarIcon: ({ focused }) => <TabIcon icon="⚙️" label="Settings" focused={focused} />,
        }}
      />
    </Tabs>
  );
}
