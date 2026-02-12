/**
 * Editor Settings Page
 *
 * Configure code editor preferences.
 * Migrated from app/settings/editor.tsx (React Native) to web React.
 */

import { ArrowLeft } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

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
  const Wrapper = onPress ? 'button' : 'div';

  return (
    <Wrapper
      onClick={onPress}
      className={`py-4 flex items-center justify-between w-full text-left ${
        onPress ? 'hover:bg-neutral-800 cursor-pointer' : ''
      }`}
    >
      <div className="flex-1 min-w-0">
        <span className="text-white font-body">{title}</span>
        {subtitle && <p className="text-sm text-neutral-500 font-body mt-0.5">{subtitle}</p>}
      </div>

      {value && <span className="text-neutral-400 font-body">{value}</span>}

      {toggle && (
        <button
          type="button"
          role="switch"
          aria-checked={toggle.value}
          onClick={(e) => {
            e.stopPropagation();
            toggle.onValueChange(!toggle.value);
          }}
          className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors ${
            toggle.value ? 'bg-teal-600' : 'bg-neutral-700'
          }`}
        >
          <span
            className={`pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow transform transition-transform ${
              toggle.value ? 'translate-x-5' : 'translate-x-0'
            }`}
          />
        </button>
      )}

      {onPress && !toggle && <span className="text-neutral-600 text-lg ml-2">&rsaquo;</span>}
    </Wrapper>
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
      <p className="text-white font-body mb-3">{title}</p>
      <div className="flex flex-wrap gap-2">
        {options.map((option) => (
          <button
            key={option.value}
            onClick={() => onSelect(option.value)}
            className={`px-4 py-2 text-sm font-body rounded-organic-button transition-colors ${
              selected === option.value
                ? 'bg-coral-500 text-white'
                : 'bg-surface-elevated text-neutral-400 hover:text-neutral-300'
            }`}
          >
            {option.label}
          </button>
        ))}
      </div>
    </div>
  );
}

function Divider() {
  return <div className="border-t border-neutral-700" />;
}

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

export function EditorSettings() {
  const navigate = useNavigate();

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
    <div className="flex-1 bg-charcoal min-h-screen">
      {/* Back navigation */}
      <div className="px-4 py-3 border-b border-neutral-800">
        <button
          onClick={() => navigate('/settings')}
          className="flex items-center gap-2 text-neutral-400 hover:text-white transition-colors font-body"
          aria-label="Back to settings"
        >
          <ArrowLeft size={18} />
          <span>Settings</span>
        </button>
      </div>

      <div className="px-6 py-4 border-b border-neutral-800">
        <h1 className="text-xl font-bold text-white font-body">Editor Settings</h1>
      </div>

      <div className="overflow-y-auto flex-1 px-6 py-6">
        {/* Appearance */}
        <div className="bg-surface mb-6 rounded-organic-card overflow-hidden shadow-organic-card">
          <div className="px-4 py-3 border-b border-neutral-700">
            <span className="text-sm font-semibold text-neutral-400 font-body">APPEARANCE</span>
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
        </div>

        {/* Formatting */}
        <div className="bg-surface mb-6 rounded-organic-card overflow-hidden shadow-organic-card">
          <div className="px-4 py-3 border-b border-neutral-700">
            <span className="text-sm font-semibold text-neutral-400 font-body">FORMATTING</span>
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
        </div>

        {/* Behavior */}
        <div className="bg-surface mb-6 rounded-organic-card overflow-hidden shadow-organic-card">
          <div className="px-4 py-3 border-b border-neutral-700">
            <span className="text-sm font-semibold text-neutral-400 font-body">BEHAVIOR</span>
          </div>
          <div className="px-4">
            <SettingRow
              title="Auto Save"
              subtitle="Automatically save files after changes"
              toggle={{ value: autoSave, onValueChange: setAutoSave }}
            />
          </div>
        </div>

        {/* Preview */}
        <div className="bg-surface rounded-organic-card overflow-hidden shadow-organic-card">
          <div className="px-4 py-3 border-b border-neutral-700">
            <span className="text-sm font-semibold text-neutral-400 font-body">PREVIEW</span>
          </div>
          <div className="p-4">
            <div
              className={`p-4 rounded-lg font-mono ${getThemeColor(theme as Theme, 'background')}`}
              style={{ fontSize: `${fontSize}px` }}
            >
              <div>
                {lineNumbers && <span className="text-neutral-600 select-none mr-4">1</span>}
                <span className={getThemeColor(theme as Theme, 'keyword')}>function</span>{' '}
                <span className={getThemeColor(theme as Theme, 'function')}>greet</span>
                <span className={getThemeColor(theme as Theme, 'text')}>(name: </span>
                <span className={getThemeColor(theme as Theme, 'type')}>string</span>
                <span className={getThemeColor(theme as Theme, 'text')}>) {'{'}</span>
              </div>
              <div>
                {lineNumbers && <span className="text-neutral-600 select-none mr-4">2</span>}
                <span className={getThemeColor(theme as Theme, 'text')}>{'  '}</span>
                <span className={getThemeColor(theme as Theme, 'keyword')}>return</span>{' '}
                <span className={getThemeColor(theme as Theme, 'text')}>
                  {`\`Hello, \${name}\``}
                </span>
              </div>
              <div>
                {lineNumbers && <span className="text-neutral-600 select-none mr-4">3</span>}
                <span className={getThemeColor(theme as Theme, 'text')}>{'}'}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
