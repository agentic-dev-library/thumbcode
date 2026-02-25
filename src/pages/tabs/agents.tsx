/**
 * Agents Screen
 *
 * Dashboard showing all AI agents, their status, and metrics.
 * All data logic lives in useAgentList; this file is layout only.
 */

import { CheckCircle, Eye, Search, Star, Users, Zap } from 'lucide-react';
import type React from 'react';
import { memo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { ProgressBar } from '@/components/feedback/Progress';
import { useAgentList } from '@/hooks';
import type { Agent as StoreAgent } from '@/state';

function getStatusBadgeVariant(status: StoreAgent['status']): {
  bg: string;
  text: string;
  label: string;
} {
  switch (status) {
    case 'working':
    case 'needs_review':
      return { bg: 'bg-teal-600/20', text: 'text-teal-400', label: 'Active' };
    case 'idle':
    case 'complete':
      return { bg: 'bg-neutral-600', text: 'text-neutral-200', label: 'Inactive' };
    case 'error':
      return { bg: 'bg-coral-500/20', text: 'text-coral-400', label: 'Error' };
    case 'awaiting_approval':
    case 'blocked':
      return { bg: 'bg-gold-500/20', text: 'text-gold-400', label: 'Pending' };
    default:
      return { bg: 'bg-neutral-600', text: 'text-neutral-200', label: 'Inactive' };
  }
}

function getRoleColor(role: StoreAgent['role']): string {
  switch (role) {
    case 'architect':
      return 'bg-gold-500/20';
    case 'implementer':
      return 'bg-teal-500/20';
    case 'reviewer':
      return 'bg-coral-500/20';
    case 'tester':
      return 'bg-teal-500/20';
    default:
      return 'bg-neutral-500/20';
  }
}

function AvatarIcon({
  role,
  size = 28,
}: {
  role: StoreAgent['role'];
  size?: number;
}): React.ReactElement {
  switch (role) {
    case 'architect':
      return <Star size={size} className="text-gold-400" />;
    case 'implementer':
      return <Zap size={size} className="text-teal-500" />;
    case 'reviewer':
      return <Eye size={size} className="text-coral-500" />;
    case 'tester':
      return <Search size={size} className="text-teal-500" />;
    default:
      return <Users size={size} className="text-neutral-400" />;
  }
}

interface RoleFilterButtonProps {
  role: string;
  isSelected: boolean;
  onPress: (role: string) => void;
}

const RoleFilterButton = memo(({ role, isSelected, onPress }: Readonly<RoleFilterButtonProps>) => (
  <button
    type="button"
    data-testid={`role-filter-${role}`}
    onClick={() => onPress(role)}
    className={`shrink-0 px-4 py-2 capitalize font-body transition-colors tap-feedback ${
      isSelected
        ? 'bg-coral-500 text-white'
        : 'bg-surface text-neutral-400 hover:bg-surface-elevated'
    } rounded-organic-button`}
  >
    {role}
  </button>
));

export default function AgentsPage() {
  const navigate = useNavigate();
  const {
    selectedRole,
    setSelectedRole,
    filteredAgents,
    totalAgents,
    activeAgents,
    totalCompletedTasks,
    getAgentMetrics,
  } = useAgentList();

  const handleRolePress = useCallback((role: string) => setSelectedRole(role), [setSelectedRole]);

  const handleAllPress = useCallback(() => setSelectedRole(null), [setSelectedRole]);

  return (
    <div
      className="flex-1 overflow-y-auto bg-charcoal animate-page-enter hide-scrollbar"
      data-testid="agents-screen"
    >
      <div className="w-full p-4">
        {/* Overview */}
        <div className="flex gap-3 mb-4">
          <div
            className="bg-surface p-4 flex-1 rounded-organic-card shadow-organic-card tap-feedback"
            style={{ transform: 'rotate(-0.3deg)' }}
          >
            <div className="mb-2">
              <Users size={28} className="text-coral-500" />
            </div>
            <span className="block text-xl font-bold font-body text-white">
              {activeAgents}/{totalAgents}
            </span>
            <span className="text-sm font-body text-neutral-400">Active Agents</span>
          </div>

          <div
            className="bg-surface p-4 flex-1 rounded-organic-card shadow-organic-card tap-feedback"
            style={{ transform: 'rotate(0.3deg)' }}
          >
            <div className="mb-2">
              <CheckCircle size={28} className="text-teal-500" />
            </div>
            <span className="block text-xl font-bold font-body text-white">
              {totalCompletedTasks}
            </span>
            <span className="text-sm font-body text-neutral-400">Tasks Completed</span>
          </div>
        </div>

        {/* Role Filter */}
        <div className="flex flex-nowrap gap-2 mb-4 overflow-x-auto pb-1">
          <button
            type="button"
            data-testid="role-filter-all"
            onClick={handleAllPress}
            className={`shrink-0 px-4 py-2 font-body transition-colors tap-feedback ${
              !selectedRole
                ? 'bg-coral-500 text-white'
                : 'bg-surface text-neutral-400 hover:bg-surface-elevated'
            } rounded-organic-badge`}
          >
            All
          </button>

          {['architect', 'implementer', 'reviewer', 'tester'].map((role) => (
            <RoleFilterButton
              key={role}
              role={role}
              isSelected={selectedRole === role}
              onPress={handleRolePress}
            />
          ))}
        </div>

        {/* Agent Cards */}
        <div className="flex flex-col gap-4">
          {filteredAgents.map((agent) => {
            const statusBadge = getStatusBadgeVariant(agent.status);
            const metrics = getAgentMetrics(agent);

            return (
              <button
                type="button"
                key={agent.id}
                onClick={() => navigate(`/agent/${agent.id}`)}
                className="bg-surface p-4 rounded-organic-card shadow-organic-card hover:bg-surface-elevated transition-colors text-left tap-feedback"
              >
                {/* Header */}
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-14 h-14 flex items-center justify-center rounded-organic-card ${getRoleColor(agent.role)}`}
                    >
                      <AvatarIcon role={agent.role} />
                    </div>
                    <div>
                      <span className="block font-body font-semibold text-white text-lg">
                        {agent.name}
                      </span>
                    </div>
                  </div>
                  <span
                    className={`text-xs font-body font-medium px-2 py-0.5 rounded-organic-badge ${statusBadge.bg} ${statusBadge.text}`}
                  >
                    {agent.status.replaceAll('_', ' ')}
                  </span>
                </div>

                {/* Current Task Progress */}
                {metrics.currentTask && (
                  <div className="bg-charcoal p-3 mb-4 rounded-organic-card">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-body text-neutral-300 truncate flex-1">
                        {metrics.currentTask.description}
                      </span>
                      <span className="text-sm font-body text-teal-400 ml-2">
                        {metrics.progress}%
                      </span>
                    </div>
                    <ProgressBar value={metrics.progress} color="secondary" size="sm" />
                  </div>
                )}

                {/* Metrics */}
                <div className="flex justify-around">
                  <div className="text-center">
                    <span className="block font-body font-semibold text-white">
                      {metrics.completedTasks}
                    </span>
                    <span className="text-xs font-body text-neutral-500">Tasks</span>
                  </div>
                  <div className="text-center">
                    <span className="block font-body font-semibold text-white">
                      {metrics.successRate}
                    </span>
                    <span className="text-xs font-body text-neutral-500">Success</span>
                  </div>
                  <div className="text-center">
                    <span className="block font-body font-semibold text-white">
                      {metrics.activeTasks}
                    </span>
                    <span className="text-xs font-body text-neutral-500">Active</span>
                  </div>
                </div>
              </button>
            );
          })}

          {filteredAgents.length === 0 && (
            <div className="text-center py-8">
              <Users size={48} className="text-neutral-600 mx-auto mb-3" />
              <p className="text-neutral-400 font-body">No agents match the selected filter.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
