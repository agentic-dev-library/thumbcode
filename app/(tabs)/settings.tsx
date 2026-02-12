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
import { Linking, Pressable, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Avatar } from '@/components/display';
import {
  AgentIcon,
  BellIcon,
  BookIcon,
  BrainIcon,
  BranchIcon,
  InfoIcon,
  KeyboardIcon,
  LegalIcon,
  LinkIcon,
  PaletteIcon,
  SupportIcon,
  VibrateIcon,
} from '@/components/icons';
import { Container, Divider, VStack } from '@/components/layout';
import { SettingsItem, SettingsSection } from '@/components/settings';
import { Text } from '@/components/ui';
import { organicBorderRadius } from '@/lib/organic-styles';

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

  const themeLabelMap: Record<string, string> = { system: 'System', dark: 'Dark', light: 'Light' };
  const themeLabel = themeLabelMap[settings.theme] ?? 'System';

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
        <SettingsSection title="CREDENTIALS">
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
        </SettingsSection>

        {/* Preferences */}
        <SettingsSection title="PREFERENCES">
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
        </SettingsSection>

        {/* Agent Settings */}
        <SettingsSection title="AGENT SETTINGS">
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
        </SettingsSection>

        {/* About */}
        <SettingsSection title="ABOUT">
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
        </SettingsSection>

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
