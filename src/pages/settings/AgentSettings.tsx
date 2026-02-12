/**
 * Agent Settings Page
 *
 * Configure agent behavior, approval settings, and automation preferences.
 * Migrated from app/settings/agents.tsx (React Native) to web React.
 */

import { ArrowLeft, Lightbulb } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

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

function getBadgeClasses(variant: 'success' | 'warning' | 'error' | 'secondary'): string {
  switch (variant) {
    case 'success':
      return 'bg-teal-500/20 text-teal-400';
    case 'warning':
      return 'bg-gold-400/20 text-gold-400';
    case 'error':
      return 'bg-coral-500/20 text-coral-500';
    case 'secondary':
      return 'bg-neutral-700/50 text-neutral-400';
  }
}

function SettingRow({ title, subtitle, value, badge, onPress, toggle }: Readonly<SettingRowProps>) {
  const _isInteractive = !!onPress || !!toggle;
  const Wrapper = onPress ? 'button' : 'div';

  return (
    <Wrapper
      onClick={onPress}
      className={`py-4 flex items-center justify-between w-full text-left ${
        onPress ? 'hover:bg-neutral-800 cursor-pointer' : ''
      }`}
    >
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-white font-body">{title}</span>
          {badge && (
            <span
              className={`inline-flex items-center px-2 py-0.5 text-xs font-medium rounded-organic-badge ${getBadgeClasses(badge.variant)}`}
            >
              {badge.label}
            </span>
          )}
        </div>
        {subtitle && <p className="text-sm text-neutral-500 font-body mt-0.5">{subtitle}</p>}
      </div>

      {value && <span className="text-neutral-400 font-body mr-2">{value}</span>}

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
    <div className="py-4">
      <p className="text-white font-body mb-1">{title}</p>
      <p className="text-sm text-neutral-500 font-body mb-4">{description}</p>
      <div className="space-y-2">
        {levels.map((level) => (
          <button
            type="button"
            key={level.id}
            onClick={() => onSelect(level.id)}
            className={`w-full p-4 border text-left rounded-organic-button transition-colors ${
              selected === level.id
                ? 'border-coral-500 bg-coral-500/10'
                : 'border-neutral-700 bg-charcoal hover:border-neutral-600'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex-1 min-w-0">
                <p
                  className={`font-body ${selected === level.id ? 'text-coral-500' : 'text-white'}`}
                >
                  {level.label}
                </p>
                <p className="text-sm text-neutral-500 font-body mt-0.5">{level.description}</p>
              </div>
              <div
                className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ml-3 ${
                  selected === level.id ? 'border-coral-500 bg-coral-500' : 'border-neutral-600'
                }`}
              >
                {selected === level.id && <div className="w-2 h-2 rounded-full bg-white" />}
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

function Divider() {
  return <div className="border-t border-neutral-700" />;
}

export function AgentSettings() {
  const navigate = useNavigate();

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
    <div className="flex-1 bg-charcoal min-h-screen">
      {/* Back navigation */}
      <div className="px-4 py-3 border-b border-neutral-800">
        <button
          type="button"
          onClick={() => navigate('/settings')}
          className="flex items-center gap-2 text-neutral-400 hover:text-white transition-colors font-body"
          aria-label="Back to settings"
        >
          <ArrowLeft size={18} />
          <span>Settings</span>
        </button>
      </div>

      <div className="px-6 py-4 border-b border-neutral-800">
        <h1 className="text-xl font-bold text-white font-body">Agent Settings</h1>
      </div>

      <div className="overflow-y-auto flex-1 px-6 py-6">
        {/* Automation */}
        <div className="bg-surface mb-6 rounded-organic-card overflow-hidden shadow-organic-card">
          <div className="px-4 py-3 border-b border-neutral-700">
            <span className="text-sm font-semibold text-neutral-400 font-body">AUTOMATION</span>
          </div>
          <div className="px-4">
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
          </div>
        </div>

        {/* Approval Settings */}
        <div className="bg-surface mb-6 rounded-organic-card overflow-hidden shadow-organic-card">
          <div className="px-4 py-3 border-b border-neutral-700">
            <span className="text-sm font-semibold text-neutral-400 font-body">
              APPROVAL REQUIREMENTS
            </span>
          </div>
          <div className="px-4">
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
          </div>
        </div>

        {/* Advanced */}
        <div className="bg-surface mb-6 rounded-organic-card overflow-hidden shadow-organic-card">
          <div className="px-4 py-3 border-b border-neutral-700">
            <span className="text-sm font-semibold text-neutral-400 font-body">ADVANCED</span>
          </div>
          <div className="px-4">
            <SettingRow
              title="Verbose Logging"
              subtitle="Show detailed agent activity in chat"
              toggle={{ value: verboseLogging, onValueChange: setVerboseLogging }}
            />
          </div>
        </div>

        {/* Info Box */}
        <div className="bg-gold-400/10 p-4 rounded-organic-card">
          <div className="flex items-start gap-3">
            <div className="mt-0.5 shrink-0">
              <Lightbulb size={18} className="text-gold-400" />
            </div>
            <div className="flex-1">
              <p className="text-gold-400 font-semibold font-body">Tip</p>
              <p className="text-sm text-gold-400/80 font-body mt-1">
                Start with "Require Approval" for all actions while you get familiar with how agents
                work. You can relax these settings as you build trust.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
