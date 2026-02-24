/**
 * Agent Detail Page
 *
 * Production agent detail backed by @thumbcode/state.
 * Composes AgentMetrics, AgentActions, and AgentHistory
 * with data from the useAgentDetail hook.
 */

import type { AgentRole } from '@/state';
import { ArrowLeft, Eye, FlaskConical, Sparkles, Zap } from 'lucide-react';
import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { AgentActions, AgentHistory, AgentMetrics } from '@/components/agents';
import { getRoleColor, getStatusBadgeClasses, ROLE_DESCRIPTION, useAgentDetail } from '@/hooks';

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

  const { agent, tasks, currentTask, metrics, statusVariant, setIdle, setWorking } =
    useAgentDetail(id);

  if (!id || !agent) {
    return (
      <div className="flex-1 flex items-center justify-center px-6 bg-charcoal min-h-screen">
        <div className="text-center">
          <h1 className="font-display text-xl text-white mb-2">Agent not found</h1>
          <p className="text-neutral-500 mb-6">
            This agent ID doesn't exist in local state. Go back and select an agent from the list.
          </p>
          <button
            type="button"
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

  return (
    <div className="flex-1 bg-charcoal min-h-screen">
      {/* Back navigation */}
      <div className="px-4 py-3 border-b border-neutral-800">
        <button
          type="button"
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
            className={`w-20 h-20 flex items-center justify-center ${getRoleColor(agent.role)} rounded-organic-hero`}
            role="img"
            aria-label={`${agent.role} agent`}
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
          <div className="bg-surface p-4 rounded-organic-card shadow-organic-card">
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
              <output className="text-sm text-teal-400 font-body" aria-live="polite">
                {metrics.progress}%
              </output>
            </div>
            <div
              className="w-full h-2 bg-neutral-700 rounded-full overflow-hidden"
              role="progressbar"
              aria-valuenow={metrics.progress}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label="Task progress"
            >
              <div
                className="h-full bg-teal-500 rounded-full transition-all duration-300"
                style={{ width: `${metrics.progress}%` }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex border-b border-neutral-800">
        {(['overview', 'history'] as const).map((tab) => (
          <button
            type="button"
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
            <AgentMetrics
              completed={metrics.completed}
              failed={metrics.failed}
              successRate={metrics.successRate}
            />
            <AgentActions
              agentId={agent.id}
              onSetIdle={() => setIdle()}
              onSetWorking={() => setWorking()}
            />
          </div>
        ) : (
          <AgentHistory tasks={tasks} />
        )}
      </div>
    </div>
  );
}
