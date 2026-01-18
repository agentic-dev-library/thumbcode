/**
 * Settings Screen
 *
 * App settings, credential management, and preferences.
 */

import { useRouter } from 'expo-router';
import { Linking, Pressable, ScrollView, Switch, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Avatar, Badge } from '@/components/display';
import { Container, Divider, HStack, VStack } from '@/components/layout';
import { Text } from '@/components/ui';

interface SettingsItemProps {
  icon: string;
  title: string;
  subtitle?: string;
  value?: string;
  badge?: string;
  showArrow?: boolean;
  onPress?: () => void;
  toggle?: {
    value: boolean;
    onValueChange: (value: boolean) => void;
  };
}

function SettingsItem({
  icon,
  title,
  subtitle,
  value,
  badge,
  showArrow = true,
  onPress,
  toggle,
}: SettingsItemProps) {
  return (
    <Pressable
      onPress={onPress}
      disabled={!onPress && !toggle}
      className={`py-4 ${onPress ? 'active:bg-neutral-800' : ''}`}
    >
      <HStack align="center">
        <View
          className="w-10 h-10 bg-surface-elevated items-center justify-center mr-4"
          style={{
            borderTopLeftRadius: 10,
            borderTopRightRadius: 8,
            borderBottomRightRadius: 12,
            borderBottomLeftRadius: 6,
          }}
        >
          <Text>{icon}</Text>
        </View>

        <VStack spacing="none" className="flex-1">
          <HStack align="center">
            <Text className="text-white">{title}</Text>
            {badge && (
              <View className="ml-2">
                <Badge variant="success" size="sm">
                  {badge}
                </Badge>
              </View>
            )}
          </HStack>
          {subtitle && (
            <Text size="sm" className="text-neutral-500">
              {subtitle}
            </Text>
          )}
        </VStack>

        {value && <Text className="text-neutral-400 mr-2">{value}</Text>}

        {toggle && (
          <Switch
            value={toggle.value}
            onValueChange={toggle.onValueChange}
            trackColor={{ false: '#374151', true: '#0D9488' }}
            thumbColor={toggle.value ? '#fff' : '#9CA3AF'}
          />
        )}

        {showArrow && !toggle && <Text className="text-neutral-600">›</Text>}
      </HStack>
    </Pressable>
  );
}

export default function SettingsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  // Mock state - in production would come from stores
  const hapticFeedback = true;
  const notifications = true;

  return (
    <ScrollView
      className="flex-1 bg-charcoal"
      contentContainerStyle={{ paddingBottom: insets.bottom + 100 }}
      showsVerticalScrollIndicator={false}
    >
      <Container padding="lg">
        {/* Profile */}
        <Pressable
          className="bg-surface p-4 mb-6 flex-row items-center active:bg-neutral-700"
          style={{
            borderTopLeftRadius: 16,
            borderTopRightRadius: 14,
            borderBottomRightRadius: 18,
            borderBottomLeftRadius: 12,
          }}
        >
          <Avatar name="User" size="lg" />
          <VStack spacing="xs" className="ml-4 flex-1">
            <Text weight="semibold" className="text-white text-lg">
              ThumbCode User
            </Text>
            <Text size="sm" className="text-neutral-400">
              View and edit profile
            </Text>
          </VStack>
          <Text className="text-neutral-600 text-lg">›</Text>
        </Pressable>

        {/* Credentials */}
        <VStack
          spacing="none"
          className="bg-surface mb-6"
          style={{
            borderTopLeftRadius: 14,
            borderTopRightRadius: 12,
            borderBottomRightRadius: 16,
            borderBottomLeftRadius: 10,
            overflow: 'hidden',
          }}
        >
          <View className="px-4 py-3 border-b border-neutral-700">
            <Text size="sm" weight="semibold" className="text-neutral-400">
              CREDENTIALS
            </Text>
          </View>
          <View className="px-4">
            <SettingsItem
              icon="🔗"
              title="GitHub"
              subtitle="github.com/user"
              badge="Connected"
              onPress={() => router.push('/settings/credentials')}
            />
            <Divider />
            <SettingsItem
              icon="🧠"
              title="Anthropic"
              subtitle="Claude API"
              badge="Active"
              onPress={() => router.push('/settings/credentials')}
            />
            <Divider />
            <SettingsItem
              icon="🤖"
              title="OpenAI"
              subtitle="Not connected"
              onPress={() => router.push('/settings/credentials')}
            />
          </View>
        </VStack>

        {/* Preferences */}
        <VStack
          spacing="none"
          className="bg-surface mb-6"
          style={{
            borderTopLeftRadius: 14,
            borderTopRightRadius: 12,
            borderBottomRightRadius: 16,
            borderBottomLeftRadius: 10,
            overflow: 'hidden',
          }}
        >
          <View className="px-4 py-3 border-b border-neutral-700">
            <Text size="sm" weight="semibold" className="text-neutral-400">
              PREFERENCES
            </Text>
          </View>
          <View className="px-4">
            <SettingsItem icon="🎨" title="Appearance" value="Dark" onPress={() => {}} />
            <Divider />
            <SettingsItem
              icon="📳"
              title="Haptic Feedback"
              showArrow={false}
              toggle={{
                value: hapticFeedback,
                onValueChange: () => {},
              }}
            />
            <Divider />
            <SettingsItem
              icon="🔔"
              title="Notifications"
              showArrow={false}
              toggle={{
                value: notifications,
                onValueChange: () => {},
              }}
            />
            <Divider />
            <SettingsItem
              icon="⌨️"
              title="Editor Settings"
              onPress={() => router.push('/settings/editor')}
            />
          </View>
        </VStack>

        {/* Agent Settings */}
        <VStack
          spacing="none"
          className="bg-surface mb-6"
          style={{
            borderTopLeftRadius: 14,
            borderTopRightRadius: 12,
            borderBottomRightRadius: 16,
            borderBottomLeftRadius: 10,
            overflow: 'hidden',
          }}
        >
          <View className="px-4 py-3 border-b border-neutral-700">
            <Text size="sm" weight="semibold" className="text-neutral-400">
              AGENT SETTINGS
            </Text>
          </View>
          <View className="px-4">
            <SettingsItem
              icon="🤖"
              title="Agent Behavior"
              subtitle="Auto-review, approval settings"
              onPress={() => router.push('/settings/agents')}
            />
            <Divider />
            <SettingsItem
              icon="🔀"
              title="Branch Protection"
              subtitle="Protected branches and rules"
              onPress={() => router.push('/settings/agents')}
            />
          </View>
        </VStack>

        {/* About */}
        <VStack
          spacing="none"
          className="bg-surface mb-6"
          style={{
            borderTopLeftRadius: 14,
            borderTopRightRadius: 12,
            borderBottomRightRadius: 16,
            borderBottomLeftRadius: 10,
            overflow: 'hidden',
          }}
        >
          <View className="px-4 py-3 border-b border-neutral-700">
            <Text size="sm" weight="semibold" className="text-neutral-400">
              ABOUT
            </Text>
          </View>
          <View className="px-4">
            <SettingsItem
              icon="📖"
              title="Documentation"
              onPress={() => Linking.openURL('https://thumbcode.dev/docs')}
            />
            <Divider />
            <SettingsItem
              icon="💬"
              title="Support"
              onPress={() => Linking.openURL('https://thumbcode.dev/support')}
            />
            <Divider />
            <SettingsItem
              icon="⚖️"
              title="Terms & Privacy"
              onPress={() => Linking.openURL('https://thumbcode.dev/legal')}
            />
            <Divider />
            <SettingsItem icon="ℹ️" title="Version" value="1.0.0" showArrow={false} />
          </View>
        </VStack>

        {/* Danger Zone */}
        <Pressable
          className="bg-coral-500/10 p-4 items-center active:bg-coral-500/20"
          style={{
            borderTopLeftRadius: 14,
            borderTopRightRadius: 12,
            borderBottomRightRadius: 16,
            borderBottomLeftRadius: 10,
          }}
        >
          <Text className="text-coral-500 font-semibold">Sign Out</Text>
        </Pressable>
      </Container>
    </ScrollView>
  );
}
