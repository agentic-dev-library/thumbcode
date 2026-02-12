/**
 * Settings Screen
 *
 * App settings, credential management, and preferences.
 * Migrated from React Native to web React with Tailwind CSS.
 */

import {
  selectCredentialByProvider,
  selectGitHubProfile,
  selectSettings,
  useCredentialStore,
  useUserStore,
} from '@thumbcode/state';
import type { LucideIcon } from 'lucide-react';
import {
  Bell,
  Book,
  Brain,
  ChevronRight,
  GitBranch,
  Info,
  Keyboard,
  Link,
  LogOut,
  Palette,
  Scale,
  Smartphone,
  Users,
  Vibrate,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

/** Reusable settings row */
interface SettingsItemProps {
  Icon: LucideIcon;
  iconClassName?: string;
  title: string;
  subtitle?: string;
  value?: string;
  badge?: string;
  showArrow?: boolean;
  onClick?: () => void;
  toggle?: {
    value: boolean;
    onChange: (value: boolean) => void;
  };
}

function SettingsItemRow({
  Icon,
  iconClassName = 'text-neutral-400',
  title,
  subtitle,
  value,
  badge,
  showArrow = true,
  onClick,
  toggle,
}: Readonly<SettingsItemProps>) {
  const isInteractive = !!onClick || !!toggle;
  const Tag = onClick ? 'button' : 'div';

  return (
    <Tag
      onClick={onClick}
      className={`py-4 flex items-center w-full text-left ${onClick ? 'hover:bg-neutral-800 transition-colors' : ''}`}
      {...(isInteractive ? {} : {})}
    >
      <div className="w-10 h-10 bg-surface-elevated flex items-center justify-center mr-4 rounded-organic-badge">
        <Icon size={22} className={iconClassName} />
      </div>

      <div className="flex-1">
        <div className="flex items-center">
          <span className="font-body text-white">{title}</span>
          {badge && (
            <span className="ml-2 text-xs font-body font-medium text-teal-400 bg-teal-600/20 px-2 py-0.5 rounded-organic-badge">
              {badge}
            </span>
          )}
        </div>
        {subtitle && <span className="text-sm font-body text-neutral-500">{subtitle}</span>}
      </div>

      {value && <span className="font-body text-neutral-400 mr-2">{value}</span>}

      {toggle && (
        <label className="relative inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            className="sr-only peer"
            checked={toggle.value}
            onChange={(e) => toggle.onChange(e.target.checked)}
          />
          <div className="w-11 h-6 bg-neutral-700 peer-checked:bg-teal-600 rounded-full transition-colors after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-neutral-400 peer-checked:after:bg-neutral-50 after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-full" />
        </label>
      )}

      {showArrow && !toggle && <ChevronRight size={16} className="text-neutral-600" />}
    </Tag>
  );
}

/** Settings section with title */
function SettingsSectionGroup({
  title,
  children,
}: Readonly<{ title: string; children: React.ReactNode }>) {
  return (
    <div className="bg-surface rounded-organic-card overflow-hidden mb-6">
      <div className="px-4 py-3 border-b border-neutral-700">
        <span className="text-sm font-body font-semibold text-neutral-400">{title}</span>
      </div>
      <div className="px-4">{children}</div>
    </div>
  );
}

function HorizontalDivider() {
  return <div className="h-px w-full bg-neutral-700" />;
}

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((part) => part[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

export default function SettingsPage() {
  const navigate = useNavigate();

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

  const displayName = profile?.name || profile?.login || 'ThumbCode User';

  return (
    <div className="flex-1 overflow-y-auto bg-charcoal" data-testid="settings-screen">
      <div className="w-full p-6">
        {/* Profile */}
        <button
          type="button"
          className="bg-surface p-4 mb-6 flex items-center rounded-organic-card shadow-organic-card hover:bg-surface-elevated transition-colors w-full text-left"
          style={{ transform: 'rotate(-0.2deg)' }}
        >
          <div className="w-14 h-14 rounded-full bg-neutral-700 flex items-center justify-center">
            <span className="font-body text-white text-lg font-semibold">
              {getInitials(displayName)}
            </span>
          </div>
          <div className="ml-4 flex-1">
            <span className="block font-body font-semibold text-white text-lg">{displayName}</span>
            <span className="text-sm font-body text-neutral-400">
              {profile?.login ? `github.com/${profile.login}` : 'Connect GitHub to enable sync'}
            </span>
          </div>
          <ChevronRight size={18} className="text-neutral-600" />
        </button>

        {/* Credentials */}
        <SettingsSectionGroup title="CREDENTIALS">
          <SettingsItemRow
            Icon={Link}
            iconClassName="text-teal-500"
            title="GitHub"
            subtitle={
              githubCredential?.metadata?.username
                ? `github.com/${githubCredential.metadata.username}`
                : githubCredential?.status === 'valid'
                  ? 'Connected'
                  : 'Not connected'
            }
            badge={githubBadge}
            onClick={() => navigate('/settings/credentials')}
          />
          <HorizontalDivider />
          <SettingsItemRow
            Icon={Brain}
            iconClassName="text-coral-500"
            title="Anthropic"
            subtitle="Claude API"
            badge={anthropicBadge}
            onClick={() => navigate('/settings/credentials')}
          />
          <HorizontalDivider />
          <SettingsItemRow
            Icon={Users}
            title="OpenAI"
            subtitle={openaiCredential?.status === 'valid' ? 'Connected' : 'Not connected'}
            badge={openaiBadge}
            onClick={() => navigate('/settings/credentials')}
          />
        </SettingsSectionGroup>

        {/* Preferences */}
        <SettingsSectionGroup title="PREFERENCES">
          <SettingsItemRow
            Icon={Palette}
            iconClassName="text-gold-400"
            title="Appearance"
            value={themeLabel}
            onClick={() => {
              const next =
                settings.theme === 'system'
                  ? 'dark'
                  : settings.theme === 'dark'
                    ? 'light'
                    : 'system';
              setTheme(next);
            }}
          />
          <HorizontalDivider />
          <SettingsItemRow
            Icon={Vibrate}
            title="Haptic Feedback"
            showArrow={false}
            toggle={{
              value: settings.notifications.hapticsEnabled,
              onChange: (v) => updateNotificationPreferences({ hapticsEnabled: v }),
            }}
          />
          <HorizontalDivider />
          <SettingsItemRow
            Icon={Bell}
            iconClassName="text-coral-500"
            title="Notifications"
            showArrow={false}
            toggle={{
              value: settings.notifications.pushEnabled,
              onChange: (v) => updateNotificationPreferences({ pushEnabled: v }),
            }}
          />
          <HorizontalDivider />
          <SettingsItemRow
            Icon={Keyboard}
            title="Editor Settings"
            onClick={() => navigate('/settings/editor')}
          />
        </SettingsSectionGroup>

        {/* Agent Settings */}
        <SettingsSectionGroup title="AGENT SETTINGS">
          <SettingsItemRow
            Icon={Users}
            iconClassName="text-teal-500"
            title="Agent Behavior"
            subtitle="Auto-review, approval settings"
            onClick={() => navigate('/settings/agents')}
          />
          <HorizontalDivider />
          <SettingsItemRow
            Icon={GitBranch}
            iconClassName="text-teal-500"
            title="Branch Protection"
            subtitle="Protected branches and rules"
            onClick={() => navigate('/settings/agents')}
          />
        </SettingsSectionGroup>

        {/* About */}
        <SettingsSectionGroup title="ABOUT">
          <SettingsItemRow
            Icon={Book}
            title="Documentation"
            onClick={() => window.open('https://thumbcode.dev/docs', '_blank')}
          />
          <HorizontalDivider />
          <SettingsItemRow
            Icon={Smartphone}
            iconClassName="text-coral-500"
            title="Support"
            onClick={() => window.open('https://thumbcode.dev/support', '_blank')}
          />
          <HorizontalDivider />
          <SettingsItemRow
            Icon={Scale}
            title="Terms & Privacy"
            onClick={() => window.open('https://thumbcode.dev/legal', '_blank')}
          />
          <HorizontalDivider />
          <SettingsItemRow Icon={Info} title="Version" value="1.0.0" showArrow={false} />
        </SettingsSectionGroup>

        {/* Danger Zone */}
        <button
          type="button"
          className="w-full bg-coral-500/10 p-4 rounded-organic-card text-center hover:bg-coral-500/20 transition-colors"
        >
          <div className="flex items-center justify-center gap-2">
            <LogOut size={18} className="text-coral-500" />
            <span className="text-coral-500 font-body font-semibold">Sign Out</span>
          </div>
        </button>
      </div>
    </div>
  );
}
