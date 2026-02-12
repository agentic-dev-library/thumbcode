/**
 * Agent Settings Screen
 *
 * Configure agent behavior, approval settings, and automation preferences.
 */

import { Stack } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, Switch, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Badge } from '@/components/display';
import { LightbulbIcon } from '@/components/icons';
import { Container, Divider, HStack, VStack } from '@/components/layout';
import { Text } from '@/components/ui';
import { organicBorderRadius } from '@/lib/organic-styles';
import { getColor } from '@/utils/design-tokens';

interface SettingRowProps {
  title: string;
  subtitle?: string;
  value?: string;
  badge?: { label: string; variant: 'success' | 'warning' | 'error' | 'secondary' };
  onPress?: () => void;
  toggle?: {
    value: boolean;
    onValueChange: (value: boolean) => void;
  };
}

function SettingRow({ title, subtitle, value, badge, onPress, toggle }: Readonly<SettingRowProps>) {
  return (
    <Pressable
      onPress={onPress}
      disabled={!onPress && !toggle}
      className={`py-4 ${onPress ? 'active:bg-neutral-800' : ''}`}
    >
      <HStack justify="between" align="center">
        <VStack spacing="xs" className="flex-1">
          <HStack align="center">
            <Text className="text-white">{title}</Text>
            {badge && (
              <View className="ml-2">
                <Badge variant={badge.variant} size="sm">
                  {badge.label}
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

        {onPress && !toggle && <Text className="text-neutral-600">›</Text>}
      </HStack>
    </Pressable>
  );
}

interface ApprovalLevelSelectorProps {
  title: string;
  description: string;
  levels: Array<{ id: string; label: string; description: string }>;
  selected: string;
  onSelect: (id: string) => void;
}

function ApprovalLevelSelector({
  title,
  description,
  levels,
  selected,
  onSelect,
}: Readonly<ApprovalLevelSelectorProps>) {
  return (
    <View className="py-4">
      <Text className="text-white mb-1">{title}</Text>
      <Text size="sm" className="text-neutral-500 mb-4">
        {description}
      </Text>
      <VStack spacing="sm">
        {levels.map((level) => (
          <Pressable
            key={level.id}
            onPress={() => onSelect(level.id)}
            className={`p-4 border ${selected === level.id ? 'border-coral-500 bg-coral-500/10' : 'border-neutral-700 bg-charcoal'}`}
            style={organicBorderRadius.button}
          >
            <HStack justify="between" align="center">
              <VStack spacing="xs" className="flex-1">
                <Text className={selected === level.id ? 'text-coral-500' : 'text-white'}>
                  {level.label}
                </Text>
                <Text size="sm" className="text-neutral-500">
                  {level.description}
                </Text>
              </VStack>
              <View
                className={`w-5 h-5 rounded-full border-2 items-center justify-center ${selected === level.id ? 'border-coral-500 bg-coral-500' : 'border-neutral-600'}`}
              >
                {selected === level.id && <View className="w-2 h-2 rounded-full bg-white" />}
              </View>
            </HStack>
          </Pressable>
        ))}
      </VStack>
    </View>
  );
}

export default function AgentSettingsScreen() {
  const insets = useSafeAreaInsets();

  // Settings state
  const [autoReview, setAutoReview] = useState(true);
  const [autoTest, setAutoTest] = useState(true);
  const [commitApproval, setCommitApproval] = useState('require');
  const [pushApproval, setPushApproval] = useState('require');
  const [deployApproval, setDeployApproval] = useState('require');
  const [parallelAgents, setParallelAgents] = useState(true);
  const [verboseLogging, setVerboseLogging] = useState(false);

  const approvalLevels = [
    { id: 'auto', label: 'Automatic', description: 'Agents proceed without waiting for approval' },
    {
      id: 'notify',
      label: 'Notify Only',
      description: 'Show notification but proceed automatically',
    },
    {
      id: 'require',
      label: 'Require Approval',
      description: 'Wait for your explicit approval before proceeding',
    },
  ];

  return (
    <>
      <Stack.Screen
        options={{
          headerTitle: 'Agent Settings',
          headerBackTitle: 'Settings',
        }}
      />

      <ScrollView
        className="flex-1 bg-charcoal"
        contentContainerStyle={{ paddingBottom: insets.bottom + 40 }}
        showsVerticalScrollIndicator={false}
      >
        <Container padding="lg">
          {/* Automation */}
          <VStack
            spacing="none"
            className="bg-surface mb-6"
            style={[organicBorderRadius.card, { overflow: 'hidden' }]}
          >
            <View className="px-4 py-3 border-b border-neutral-700">
              <Text size="sm" weight="semibold" className="text-neutral-400">
                AUTOMATION
              </Text>
            </View>
            <View className="px-4">
              <SettingRow
                title="Auto-Review"
                subtitle="Reviewer automatically checks implementer changes"
                badge={{ label: 'Recommended', variant: 'success' }}
                toggle={{ value: autoReview, onValueChange: setAutoReview }}
              />
              <Divider />
              <SettingRow
                title="Auto-Test"
                subtitle="Tester runs tests after code changes"
                toggle={{ value: autoTest, onValueChange: setAutoTest }}
              />
              <Divider />
              <SettingRow
                title="Parallel Execution"
                subtitle="Allow multiple agents to work simultaneously"
                toggle={{ value: parallelAgents, onValueChange: setParallelAgents }}
              />
            </View>
          </VStack>

          {/* Approval Settings */}
          <VStack
            spacing="none"
            className="bg-surface mb-6"
            style={[organicBorderRadius.card, { overflow: 'hidden' }]}
          >
            <View className="px-4 py-3 border-b border-neutral-700">
              <Text size="sm" weight="semibold" className="text-neutral-400">
                APPROVAL REQUIREMENTS
              </Text>
            </View>
            <View className="px-4">
              <ApprovalLevelSelector
                title="Commits"
                description="When agents create git commits"
                levels={approvalLevels}
                selected={commitApproval}
                onSelect={setCommitApproval}
              />
              <Divider />
              <ApprovalLevelSelector
                title="Push to Remote"
                description="When agents push commits to GitHub"
                levels={approvalLevels}
                selected={pushApproval}
                onSelect={setPushApproval}
              />
              <Divider />
              <ApprovalLevelSelector
                title="Deployments"
                description="When agents trigger deployments"
                levels={approvalLevels}
                selected={deployApproval}
                onSelect={setDeployApproval}
              />
            </View>
          </VStack>

          {/* Advanced */}
          <VStack
            spacing="none"
            className="bg-surface mb-6"
            style={[organicBorderRadius.card, { overflow: 'hidden' }]}
          >
            <View className="px-4 py-3 border-b border-neutral-700">
              <Text size="sm" weight="semibold" className="text-neutral-400">
                ADVANCED
              </Text>
            </View>
            <View className="px-4">
              <SettingRow
                title="Verbose Logging"
                subtitle="Show detailed agent activity in chat"
                toggle={{ value: verboseLogging, onValueChange: setVerboseLogging }}
              />
            </View>
          </VStack>

          {/* Info Box */}
          <View className="bg-gold-500/10 p-4" style={organicBorderRadius.card}>
            <HStack spacing="sm" align="start">
              <View className="mt-0.5">
                <LightbulbIcon size={18} color="gold" turbulence={0.2} />
              </View>
              <VStack spacing="xs" className="flex-1">
                <Text className="text-gold-400 font-semibold">Tip</Text>
                <Text size="sm" className="text-gold-400/80">
                  Start with "Require Approval" for all actions while you get familiar with how
                  agents work. You can relax these settings as you build trust.
                </Text>
              </VStack>
            </HStack>
          </View>
        </Container>
      </ScrollView>
    </>
  );
}
