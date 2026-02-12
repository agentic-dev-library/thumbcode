/**
 * Agent Detail Page
 *
 * Production agent detail backed by @thumbcode/state.
 * Migrated from app/agent/[id].tsx (React Native) to web React.
 */

import type { Agent, AgentRole, AgentStatus } from '@thumbcode/state';
import { useAgentStore } from '@thumbcode/state';
import {
  ArrowLeft,
  Sparkles,
  Zap,
  Eye,
  FlaskConical,
} from 'lucide-react';
import { useMemo, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

const ROLE_DESCRIPTION: Record<AgentRole, string> = {
  architect:
    'Designs system architecture, creates task breakdowns, and coordinates agent workflows.',
  implementer:
    'Writes code, implements features, and resolves technical issues based on architectural plans.',
  reviewer:
    'Reviews code quality, identifies bugs, ensures best practices, and provides detailed feedback.',
  tester:
    'Creates and runs tests, validates functionality, and ensures high-quality releases with good coverage.',
};

function getStatusColor(status: AgentStatus): 'success' | 'pending' | 'error' | 'inactive' {
  switch (status) {
    case 'working':
    case 'needs_review':
    case 'complete':
      return 'success';
    case 'awaiting_approval':
    case 'blocked':
      return 'pending';
    case 'error':
      return 'error';
    default:
      return 'inactive';
  }
}

function getStatusBadgeClasses(variant: 'success' | 'pending' | 'error' | 'inactive'): string {
  switch (variant) {
    case 'success':
      return 'bg-teal-500/20 text-teal-400';
    case 'pending':
      return 'bg-gold-400/20 text-gold-400';
    case 'error':
      return 'bg-coral-500/20 text-coral-500';
    case 'inactive':
      return 'bg-neutral-700/50 text-neutral-400';
  }
}

function getRoleColor(role: AgentRole): string {
  switch (role) {
    case 'architect':
      return 'bg-gold-400/20';
    case 'implementer':
      return 'bg-teal-500/20';
    case 'reviewer':
      return 'bg-coral-500/20';
    case 'tester':
      return 'bg-teal-500/20';
  }
}

function RoleIcon({ role, size = 40 }: { role: AgentRole; size?: number }) {
  const colorMap: Record<AgentRole, string> = {
    architect: 'text-gold-400',
    implementer: 'text-teal-400',
    reviewer: 'text-coral-500',
    tester: 'text-teal-400',
  };
  const className = colorMap[role];
  switch (role) {
    case 'architect':
      return <Sparkles size={size} className={className} />;
    case 'implementer':
      return <Zap size={size} className={className} />;
    case 'reviewer':
      return <Eye size={size} className={className} />;
    case 'tester':
      return <FlaskConical size={size} className={className} />;
  }
}

export function AgentDetail() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [activeTab, setActiveTab] = useState<'overview' | 'history'>('overview');

  const agent = useAgentStore((s) => s.agents.find((a) => a.id === id));
  const tasks = useAgentStore((s) => s.tasks.filter((t) => t.agentId === id));
  const updateAgentStatus = useAgentStore((s) => s.updateAgentStatus);

  const currentTask = useMemo(() => {
    if (!agent?.currentTaskId) return null;
    return tasks.find((t) => t.id === agent.currentTaskId) ?? null;
  }, [agent?.currentTaskId, tasks]);

  const completed = tasks.filter((t) => t.status === 'completed').length;
  const failed = tasks.filter((t) => t.status === 'failed').length;
  const denom = completed + failed;
  const successRate = denom > 0 ? Math.round((completed / denom) * 100) : null;
  const progress = tasks.length > 0 ? Math.round((completed / tasks.length) * 100) : 0;

  if (!id || !agent) {
    return (
      <div className="flex-1 flex items-center justify-center px-6 bg-charcoal min-h-screen">
        <div className="text-center">
          <h1 className="font-display text-xl text-white mb-2">Agent not found</h1>
          <p className="text-neutral-500 mb-6">
            This agent ID doesn't exist in local state. Go back and select an agent from the list.
          </p>
          <button
            onClick={() => navigate(-1)}
            className="bg-surface px-4 py-3 text-white font-semibold font-body rounded-organic-button hover:bg-neutral-700 transition-colors"
            aria-label="Go back"
            data-testid="back-button"
          >
            Back
          </button>
        </div>
      </div>
    );
  }

  const statusVariant = getStatusColor(agent.status);

  return (
    <div className="flex-1 bg-charcoal min-h-screen">
      {/* Back navigation */}
      <div className="px-4 py-3 border-b border-neutral-800">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-neutral-400 hover:text-white transition-colors font-body"
          aria-label="Go back"
        >
          <ArrowLeft size={18} />
          <span>Back</span>
        </button>
      </div>

      {/* Header */}
      <div className="px-6 py-6 border-b border-neutral-800">
        <div className="flex items-center gap-5">
          <div
            className={`w-20 h-20 flex items-center justify-center ${getRoleColor(agent.role)} rounded-[28px_24px_32px_20px/20px_28px_24px_32px]`}
          >
            <RoleIcon role={agent.role} size={40} />
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 mb-1">
              <h1 className="text-xl font-bold text-white font-body">{agent.name}</h1>
              <span
                className={`inline-flex items-center px-2.5 py-0.5 text-xs font-medium capitalize rounded-organic-badge ${getStatusBadgeClasses(statusVariant)}`}
              >
                {agent.status.replaceAll('_', ' ')}
              </span>
            </div>
            <p className="text-sm text-neutral-400 capitalize font-body">{agent.role}</p>
            <p className="text-sm text-neutral-500 font-body mt-1 line-clamp-2">
              {ROLE_DESCRIPTION[agent.role]}
            </p>
          </div>
        </div>
      </div>

      {/* Current Task */}
      {currentTask && (
        <div className="px-6 py-4 border-b border-neutral-800">
          <div className="bg-surface p-4 rounded-organic-card">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-neutral-400 font-body">Current Task</span>
              <span
                className={`inline-flex items-center px-2 py-0.5 text-xs font-medium capitalize rounded-organic-badge ${
                  currentTask.status === 'failed'
                    ? 'bg-coral-500/20 text-coral-500'
                    : 'bg-gold-400/20 text-gold-400'
                }`}
              >
                {currentTask.status.replaceAll('_', ' ')}
              </span>
            </div>
            <p className="text-white font-body mb-3">{currentTask.description}</p>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-neutral-500 font-body">Progress</span>
              <span className="text-sm text-teal-400 font-body">{progress}%</span>
            </div>
            <div className="w-full h-2 bg-neutral-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-teal-500 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex border-b border-neutral-800">
        {(['overview', 'history'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 py-3 text-center capitalize font-body transition-colors ${
              activeTab === tab
                ? 'border-b-2 border-coral-500 text-coral-500 font-semibold'
                : 'text-neutral-400 hover:text-neutral-300'
            }`}
            aria-label={`Show ${tab}`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="overflow-y-auto flex-1 px-6 py-6">
        {activeTab === 'overview' ? (
          <div className="space-y-4">
            {/* Agent Metrics */}
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-surface p-4 rounded-organic-card text-center">
                <p className="text-2xl font-bold text-teal-400 font-body">{completed}</p>
                <p className="text-xs text-neutral-400 font-body mt-1">Completed</p>
              </div>
              <div className="bg-surface p-4 rounded-organic-card text-center">
                <p className="text-2xl font-bold text-coral-500 font-body">{failed}</p>
                <p className="text-xs text-neutral-400 font-body mt-1">Failed</p>
              </div>
              <div className="bg-surface p-4 rounded-organic-card text-center">
                <p className="text-2xl font-bold text-gold-400 font-body">
                  {successRate !== null ? `${successRate}%` : '--'}
                </p>
                <p className="text-xs text-neutral-400 font-body mt-1">Success Rate</p>
              </div>
            </div>

            {/* Agent Actions */}
            <div className="bg-surface p-4 rounded-organic-card">
              <h3 className="text-sm font-semibold text-neutral-400 font-body mb-3">ACTIONS</h3>
              <div className="flex gap-3">
                <button
                  onClick={() => updateAgentStatus(agent.id, 'idle')}
                  className="flex-1 py-2.5 bg-neutral-700 text-white font-body text-sm font-medium rounded-organic-button hover:bg-neutral-600 transition-colors"
                  data-testid="set-idle-button"
                >
                  Set Idle
                </button>
                <button
                  onClick={() => updateAgentStatus(agent.id, 'working')}
                  className="flex-1 py-2.5 bg-teal-600 text-white font-body text-sm font-medium rounded-organic-button hover:bg-teal-700 transition-colors"
                  data-testid="set-working-button"
                >
                  Set Working
                </button>
              </div>
            </div>
          </div>
        ) : (
          /* Agent History */
          <div className="space-y-3">
            {tasks.length === 0 ? (
              <p className="text-neutral-500 text-center py-8 font-body">No task history yet.</p>
            ) : (
              tasks.map((task) => (
                <div
                  key={task.id}
                  className="bg-surface p-4 rounded-organic-card"
                  style={{ transform: 'rotate(-0.15deg)' }}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm text-white font-body font-medium truncate flex-1 mr-2">
                      {task.description}
                    </span>
                    <span
                      className={`inline-flex items-center px-2 py-0.5 text-xs font-medium capitalize rounded-organic-badge ${
                        task.status === 'completed'
                          ? 'bg-teal-500/20 text-teal-400'
                          : task.status === 'failed'
                            ? 'bg-coral-500/20 text-coral-500'
                            : 'bg-gold-400/20 text-gold-400'
                      }`}
                    >
                      {task.status.replaceAll('_', ' ')}
                    </span>
                  </div>
                  {task.result && (
                    <p className="text-xs text-neutral-500 font-body mt-1">{task.result}</p>
                  )}
                  <p className="text-xs text-neutral-600 font-body mt-2">
                    {new Date(task.createdAt).toLocaleString()}
                  </p>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}
