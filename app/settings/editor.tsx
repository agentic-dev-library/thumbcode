/**
 * Editor Settings Screen
 *
 * Configure code editor preferences.
 */

import { Stack } from 'expo-router';
import { useState } from 'react';
import { Container, Divider, HStack, VStack } from '@/components/layout';
import { Text } from '@/components/ui';
import { organicBorderRadius } from '@/lib/organic-styles';
import { getColor } from '@/utils/design-tokens';

interface SettingRowProps {
  title: string;
  subtitle?: string;
  value?: string;
  onPress?: () => void;
  toggle?: {
    value: boolean;
    onValueChange: (value: boolean) => void;
  };
}

function SettingRow({ title, subtitle, value, onPress, toggle }: Readonly<SettingRowProps>) {
  return (
    <button type="button"
      onClick={onPress}
      disabled={!onPress && !toggle}
      className={`py-4 ${onPress ? 'active:bg-neutral-800' : ''}`}
    >
      <HStack justify="between" align="center">
        <VStack spacing="xs" className="flex-1">
          <Text className="text-white">{title}</Text>
          {subtitle && (
            <Text size="sm" className="text-neutral-500">
              {subtitle}
            </Text>
          )}
        </VStack>

        {value && <Text className="text-neutral-400">{value}</Text>}

        {toggle && (
          <input type="checkbox"
            checked={toggle.value}
            onChange={toggle.onValueChange}
            }
            
          />
        )}

        {onPress && !toggle && <Text className="text-neutral-600">›</Text>}
      </HStack>
    </button>
  );
}

interface OptionSelectorProps {
  title: string;
  options: Array<{ label: string; value: string }>;
  selected: string;
  onSelect: (value: string) => void;
}

function OptionSelector({ title, options, selected, onSelect }: Readonly<OptionSelectorProps>) {
  return (
    <div className="py-4">
      <Text className="text-white mb-3">{title}</Text>
      <HStack spacing="sm" className="flex-wrap">
        {options.map((option) => (
          <button type="button"
            key={option.value}
            onClick={() => onSelect(option.value)}
            className={`px-4 py-2 ${selected === option.value ? 'bg-coral-500' : 'bg-surface-elevated'}`}
            style={organicBorderRadius.button}
          >
            <Text className={selected === option.value ? 'text-white' : 'text-neutral-400'}>
              {option.label}
            </Text>
          </button>
        ))}
      </HStack>
    </div>
  );
}

// Theme color helper functions to reduce cognitive complexity
type Theme = 'light' | 'dark' | 'high-contrast';

const themeColors = {
  keyword: { light: 'text-coral-700', dark: 'text-coral-500', 'high-contrast': 'text-yellow-400' },
  function: { light: 'text-gold-700', dark: 'text-gold-400', 'high-contrast': 'text-green-400' },
  type: { light: 'text-teal-700', dark: 'text-teal-400', 'high-contrast': 'text-cyan-400' },
  text: { light: 'text-neutral-800', dark: 'text-white', 'high-contrast': 'text-white' },
  background: { light: 'bg-neutral-100', dark: 'bg-charcoal', 'high-contrast': 'bg-black' },
} as const;

function getThemeColor(theme: Theme, type: keyof typeof themeColors): string {
  return themeColors[type][theme];
}

export default function EditorSettingsScreen() {

  // Editor settings state
  const [fontSize, setFontSize] = useState('14');
  const [tabSize, setTabSize] = useState('2');
  const [theme, setTheme] = useState('dark');
  const [wordWrap, setWordWrap] = useState(true);
  const [lineNumbers, setLineNumbers] = useState(true);
  const [minimap, setMinimap] = useState(false);
  const [autoSave, setAutoSave] = useState(true);
  const [formatOnSave, setFormatOnSave] = useState(true);
  const [bracketPairColors, setBracketPairColors] = useState(true);

  return (
    <>
      <Stack.Screen
        options={{
          headerTitle: 'Editor Settings',
          headerBackTitle: 'Settings',
        }}
      />

      <div
        className="flex-1 bg-charcoal"
}
      >
        <Container padding="lg">
          {/* Appearance */}
          <VStack
            spacing="none"
            className="bg-surface mb-6"
            style={{ ...organicBorderRadius.card,  overflow: 'hidden'  }}
          >
            <div className="px-4 py-3 border-b border-neutral-700">
              <Text size="sm" weight="semibold" className="text-neutral-400">
                APPEARANCE
              </Text>
            </div>
            <div className="px-4">
              <OptionSelector
                title="Theme"
                options={[
                  { label: 'Dark', value: 'dark' },
                  { label: 'Light', value: 'light' },
                  { label: 'High Contrast', value: 'high-contrast' },
                ]}
                selected={theme}
                onSelect={setTheme}
              />
              <Divider />
              <OptionSelector
                title="Font Size"
                options={[
                  { label: '12', value: '12' },
                  { label: '14', value: '14' },
                  { label: '16', value: '16' },
                  { label: '18', value: '18' },
                ]}
                selected={fontSize}
                onSelect={setFontSize}
              />
              <Divider />
              <SettingRow
                title="Line Numbers"
                subtitle="Show line numbers in the gutter"
                toggle={{ value: lineNumbers, onValueChange: setLineNumbers }}
              />
              <Divider />
              <SettingRow
                title="Minimap"
                subtitle="Show code minimap on the right"
                toggle={{ value: minimap, onValueChange: setMinimap }}
              />
            </div>
          </VStack>

          {/* Formatting */}
          <VStack
            spacing="none"
            className="bg-surface mb-6"
            style={{ ...organicBorderRadius.card,  overflow: 'hidden'  }}
          >
            <div className="px-4 py-3 border-b border-neutral-700">
              <Text size="sm" weight="semibold" className="text-neutral-400">
                FORMATTING
              </Text>
            </div>
            <div className="px-4">
              <OptionSelector
                title="Tab Size"
                options={[
                  { label: '2 spaces', value: '2' },
                  { label: '4 spaces', value: '4' },
                  { label: 'Tab', value: 'tab' },
                ]}
                selected={tabSize}
                onSelect={setTabSize}
              />
              <Divider />
              <SettingRow
                title="Word Wrap"
                subtitle="Wrap long lines to fit the viewport"
                toggle={{ value: wordWrap, onValueChange: setWordWrap }}
              />
              <Divider />
              <SettingRow
                title="Format on Save"
                subtitle="Automatically format code when saving"
                toggle={{ value: formatOnSave, onValueChange: setFormatOnSave }}
              />
              <Divider />
              <SettingRow
                title="Bracket Pair Colors"
                subtitle="Colorize matching brackets"
                toggle={{ value: bracketPairColors, onValueChange: setBracketPairColors }}
              />
            </div>
          </VStack>

          {/* Behavior */}
          <VStack
            spacing="none"
            className="bg-surface mb-6"
            style={{ ...organicBorderRadius.card,  overflow: 'hidden'  }}
          >
            <div className="px-4 py-3 border-b border-neutral-700">
              <Text size="sm" weight="semibold" className="text-neutral-400">
                BEHAVIOR
              </Text>
            </div>
            <div className="px-4">
              <SettingRow
                title="Auto Save"
                subtitle="Automatically save files after changes"
                toggle={{ value: autoSave, onValueChange: setAutoSave }}
              />
            </div>
          </VStack>

          {/* Preview */}
          <VStack
            spacing="none"
            className="bg-surface"
            style={{ ...organicBorderRadius.card,  overflow: 'hidden'  }}
          >
            <div className="px-4 py-3 border-b border-neutral-700">
              <Text size="sm" weight="semibold" className="text-neutral-400">
                PREVIEW
              </Text>
            </div>
            <div className={`p-4 m-4 rounded-lg ${getThemeColor(theme as Theme, 'background')}`}>
              <Text
                className={`font-mono ${getThemeColor(theme as Theme, 'type')}`}
                style={{ fontSize: parseInt(fontSize, 10) }}
              >
                {lineNumbers ? '1  ' : ''}
                <Text className={getThemeColor(theme as Theme, 'keyword')}>function</Text>{' '}
                <Text className={getThemeColor(theme as Theme, 'function')}>greet</Text>
                <Text className={getThemeColor(theme as Theme, 'text')}>(name: </Text>
                <Text className={getThemeColor(theme as Theme, 'type')}>string</Text>
                <Text className={getThemeColor(theme as Theme, 'text')}>) {'{'}</Text>
              </Text>
              <Text
                className={`font-mono ${getThemeColor(theme as Theme, 'text')}`}
                style={{ fontSize: parseInt(fontSize, 10) }}
              >
                {lineNumbers ? '2  ' : ''}
                {'  '}
                <Text className={getThemeColor(theme as Theme, 'keyword')}>return</Text>{' '}
                {`\`Hello, \${name}\``}
              </Text>
              <Text
                className={`font-mono ${getThemeColor(theme as Theme, 'text')}`}
                style={{ fontSize: parseInt(fontSize, 10) }}
              >
                {lineNumbers ? '3  ' : ''}
                {'}'}
              </Text>
            </div>
          </VStack>
        </Container>
      </div>
    </>
  );
}
