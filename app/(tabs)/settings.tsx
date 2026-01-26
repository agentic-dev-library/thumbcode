/**
 * Settings Screen
 *
 * App settings, credential management, and preferences.
 * Uses paint daube icons for brand consistency.
 */

import {
  selectCredentialByProvider,
  selectGitHubProfile,
  selectSettings,
  useCredentialStore,
  useUserStore,
} from '@thumbcode/state';
import { useRouter } from 'expo-router';
import type React from 'react';
import { Linking, Pressable, ScrollView, Switch, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Avatar, Badge } from '@/components/display';
import {
  AgentIcon,
  BellIcon,
  BookIcon,
  BrainIcon,
  BranchIcon,
  type IconColor,
  InfoIcon,
  KeyboardIcon,
  LegalIcon,
  LinkIcon,
  PaletteIcon,
  SupportIcon,
  VibrateIcon,
} from '@/components/icons';
import { Container, Divider, HStack, VStack } from '@/components/layout';
import { Text } from '@/components/ui';
import { organicBorderRadius } from '@/lib/organic-styles';
import { getColor } from '@/utils/design-tokens';

interface SettingsItemProps {
  Icon: React.FC<{ size?: number; color?: IconColor; turbulence?: number }>;
  iconColor?: IconColor;
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
  Icon,
  iconColor = 'warmGray',
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
          style={organicBorderRadius.badge}
        >
          <Icon size={22} color={iconColor} turbulence={0.2} />
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
            trackColor={{ false: getColor('neutral', '700'), true: getColor('teal', '600') }}
            thumbColor={toggle.value ? getColor('neutral', '50') : getColor('neutral', '400')}
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

  const profile = useUserStore(selectGitHubProfile);
  const settings = useUserStore(selectSettings);
  const updateNotificationPreferences = useUserStore((s) => s.updateNotificationPreferences);
  const setTheme = useUserStore((s) => s.setTheme);

  const githubCredential = useCredentialStore(selectCredentialByProvider('github'));
  const anthropicCredential = useCredentialStore(selectCredentialByProvider('anthropic'));
  const openaiCredential = useCredentialStore(selectCredentialByProvider('openai'));

  const githubBadge = githubCredential?.status === 'valid' ? 'Connected' : undefined;
  const anthropicBadge = anthropicCredential?.status === 'valid' ? 'Active' : undefined;
  const openaiBadge = openaiCredential?.status === 'valid' ? 'Active' : undefined;

  const themeLabel =
    settings.theme === 'system' ? 'System' : settings.theme === 'dark' ? 'Dark' : 'Light';

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
          style={organicBorderRadius.card}
        >
          <Avatar name={profile?.login || 'User'} size="lg" />
          <VStack spacing="xs" className="ml-4 flex-1">
            <Text weight="semibold" className="text-white text-lg">
              {profile?.name || profile?.login || 'ThumbCode User'}
            </Text>
            <Text size="sm" className="text-neutral-400">
              {profile?.login ? `github.com/${profile.login}` : 'Connect GitHub to enable sync'}
            </Text>
          </VStack>
          <Text className="text-neutral-600 text-lg">›</Text>
        </Pressable>

        {/* Credentials */}
        <VStack
          spacing="none"
          className="bg-surface mb-6"
          style={[organicBorderRadius.card, { overflow: 'hidden' }]}
        >
          <View className="px-4 py-3 border-b border-neutral-700">
            <Text size="sm" weight="semibold" className="text-neutral-400">
              CREDENTIALS
            </Text>
          </View>
          <View className="px-4">
            <SettingsItem
              Icon={LinkIcon}
              iconColor="teal"
              title="GitHub"
              subtitle={
                githubCredential?.metadata?.username
                  ? `github.com/${githubCredential.metadata.username}`
                  : githubCredential?.status === 'valid'
                    ? 'Connected'
                    : 'Not connected'
              }
              badge={githubBadge}
              onPress={() => router.push('/settings/credentials')}
            />
            <Divider />
            <SettingsItem
              Icon={BrainIcon}
              iconColor="coral"
              title="Anthropic"
              subtitle="Claude API"
              badge={anthropicBadge}
              onPress={() => router.push('/settings/credentials')}
            />
            <Divider />
            <SettingsItem
              Icon={AgentIcon}
              title="OpenAI"
              subtitle={openaiCredential?.status === 'valid' ? 'Connected' : 'Not connected'}
              badge={openaiBadge}
              onPress={() => router.push('/settings/credentials')}
            />
          </View>
        </VStack>

        {/* Preferences */}
        <VStack
          spacing="none"
          className="bg-surface mb-6"
          style={[organicBorderRadius.card, { overflow: 'hidden' }]}
        >
          <View className="px-4 py-3 border-b border-neutral-700">
            <Text size="sm" weight="semibold" className="text-neutral-400">
              PREFERENCES
            </Text>
          </View>
          <View className="px-4">
            <SettingsItem
              Icon={PaletteIcon}
              iconColor="gold"
              title="Appearance"
              value={themeLabel}
              onPress={() => {
                const next =
                  settings.theme === 'system'
                    ? 'dark'
                    : settings.theme === 'dark'
                      ? 'light'
                      : 'system';
                setTheme(next);
              }}
            />
            <Divider />
            <SettingsItem
              Icon={VibrateIcon}
              title="Haptic Feedback"
              showArrow={false}
              toggle={{
                value: settings.notifications.hapticsEnabled,
                onValueChange: (v) => updateNotificationPreferences({ hapticsEnabled: v }),
              }}
            />
            <Divider />
            <SettingsItem
              Icon={BellIcon}
              iconColor="coral"
              title="Notifications"
              showArrow={false}
              toggle={{
                value: settings.notifications.pushEnabled,
                onValueChange: (v) => updateNotificationPreferences({ pushEnabled: v }),
              }}
            />
            <Divider />
            <SettingsItem
              Icon={KeyboardIcon}
              title="Editor Settings"
              onPress={() => router.push('/settings/editor')}
            />
          </View>
        </VStack>

        {/* Agent Settings */}
        <VStack
          spacing="none"
          className="bg-surface mb-6"
          style={[organicBorderRadius.card, { overflow: 'hidden' }]}
        >
          <View className="px-4 py-3 border-b border-neutral-700">
            <Text size="sm" weight="semibold" className="text-neutral-400">
              AGENT SETTINGS
            </Text>
          </View>
          <View className="px-4">
            <SettingsItem
              Icon={AgentIcon}
              iconColor="teal"
              title="Agent Behavior"
              subtitle="Auto-review, approval settings"
              onPress={() => router.push('/settings/agents')}
            />
            <Divider />
            <SettingsItem
              Icon={BranchIcon}
              iconColor="teal"
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
          style={[organicBorderRadius.card, { overflow: 'hidden' }]}
        >
          <View className="px-4 py-3 border-b border-neutral-700">
            <Text size="sm" weight="semibold" className="text-neutral-400">
              ABOUT
            </Text>
          </View>
          <View className="px-4">
            <SettingsItem
              Icon={BookIcon}
              title="Documentation"
              onPress={() => Linking.openURL('https://thumbcode.dev/docs')}
            />
            <Divider />
            <SettingsItem
              Icon={SupportIcon}
              iconColor="coral"
              title="Support"
              onPress={() => Linking.openURL('https://thumbcode.dev/support')}
            />
            <Divider />
            <SettingsItem
              Icon={LegalIcon}
              title="Terms & Privacy"
              onPress={() => Linking.openURL('https://thumbcode.dev/legal')}
            />
            <Divider />
            <SettingsItem Icon={InfoIcon} title="Version" value="1.0.0" showArrow={false} />
          </View>
        </VStack>

        {/* Danger Zone */}
        <Pressable
          className="bg-coral-500/10 p-4 items-center active:bg-coral-500/20"
          style={organicBorderRadius.card}
        >
          <Text className="text-coral-500 font-semibold">Sign Out</Text>
        </Pressable>
      </Container>
    </ScrollView>
  );
}
