/**
 * Home Screen (Dashboard)
 *
 * Main dashboard showing overview of projects, agents, and recent activity.
 * Migrated from React Native to web React with Tailwind CSS.
 */

import { selectAgents, selectProjects, useAgentStore, useProjectStore } from '@thumbcode/state';
import { Bell, CheckCircle, ClipboardList, FolderOpen, Pencil, Users } from 'lucide-react';
import type React from 'react';
import { useNavigate } from 'react-router-dom';
import { ProgressBar } from '@/components/feedback/Progress';

function statusToActivityType(status: string): string {
  switch (status) {
    case 'completed':
      return 'commit';
    case 'failed':
      return 'review';
    default:
      return 'task';
  }
}

function getStatusColor(status: string): string {
  switch (status) {
    case 'working':
    case 'needs_review':
      return 'bg-teal-500';
    case 'idle':
    case 'complete':
      return 'bg-neutral-500';
    case 'error':
      return 'bg-coral-500';
    default:
      return 'bg-gold-500';
  }
}

function ActivityIcon({ type, size = 20 }: { type: string; size?: number }): React.ReactElement {
  switch (type) {
    case 'commit':
      return <Pencil size={size} className="text-teal-500" />;
    case 'review':
      return <CheckCircle size={size} className="text-teal-500" />;
    case 'task':
      return <ClipboardList size={size} className="text-gold-400" />;
    default:
      return <Bell size={size} className="text-coral-500" />;
  }
}

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((part) => part[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

export default function HomePage() {
  const navigate = useNavigate();
  const projects = useProjectStore(selectProjects);
  const agents = useAgentStore(selectAgents);
  const tasks = useAgentStore((s) => s.tasks);

  const runningAgents = agents.filter((a) => a.status !== 'idle').length;
  const pendingTasks = tasks.filter(
    (t) => t.status === 'pending' || t.status === 'in_progress'
  ).length;
  const completedToday = tasks.filter((t) => {
    if (t.status !== 'completed' || !t.completedAt) return false;
    const d = new Date(t.completedAt);
    const now = new Date();
    return d.toDateString() === now.toDateString();
  }).length;

  const recentActivity = tasks
    .slice()
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5)
    .map((t) => {
      const agent = agents.find((a) => a.id === t.agentId);
      return {
        id: t.id,
        type: statusToActivityType(t.status),
        agent: agent?.name || 'Agent',
        message: t.description,
        project: 'workspace',
        time: new Date(t.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
    });

  return (
    <div className="flex-1 overflow-y-auto bg-charcoal" data-testid="home-screen">
      <div className="w-full p-6">
        {/* Welcome */}
        <div className="mb-6">
          <span className="text-sm font-body text-neutral-400">Welcome back</span>
          <h1 className="font-display text-2xl font-bold text-white">Dashboard</h1>
        </div>

        {/* Quick Stats */}
        <div className="flex flex-wrap gap-3 mb-6">
          <div
            className="bg-surface p-4 flex-1 min-w-[140px] rounded-organic-card shadow-organic-card"
            style={{ transform: 'rotate(-0.3deg)' }}
          >
            <div className="mb-2">
              <FolderOpen size={32} className="text-teal-500" />
            </div>
            <span className="block text-2xl font-bold font-body text-white">{projects.length}</span>
            <span className="text-sm font-body text-neutral-400">Projects</span>
          </div>

          <div
            className="bg-surface p-4 flex-1 min-w-[140px] rounded-organic-card shadow-organic-card"
            style={{ transform: 'rotate(0.3deg)' }}
          >
            <div className="mb-2">
              <Users size={32} className="text-coral-500" />
            </div>
            <span className="block text-2xl font-bold font-body text-white">{runningAgents}</span>
            <span className="text-sm font-body text-neutral-400">Running Agents</span>
          </div>

          <div
            className="bg-surface p-4 flex-1 min-w-[140px] rounded-organic-card shadow-organic-card"
            style={{ transform: 'rotate(-0.3deg)' }}
          >
            <div className="mb-2">
              <ClipboardList size={32} className="text-gold-400" />
            </div>
            <span className="block text-2xl font-bold font-body text-white">{pendingTasks}</span>
            <span className="text-sm font-body text-neutral-400">Pending Tasks</span>
          </div>
        </div>

        {/* Agent Status */}
        <div className="mb-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="font-body font-semibold text-white text-lg">Agent Team</h2>
            <button
              type="button"
              onClick={() => navigate('/agents')}
              className="text-sm font-body text-coral-500 hover:text-coral-400 transition-colors"
            >
              View All &rarr;
            </button>
          </div>

          <div className="flex flex-wrap gap-3">
            {agents.map((agent) => (
              <button
                type="button"
                key={agent.id}
                onClick={() => navigate(`/agent/${agent.id}`)}
                className="bg-surface p-3 flex items-center rounded-organic-card shadow-organic-card hover:bg-surface-elevated transition-colors text-left"
              >
                <div className="w-8 h-8 rounded-full bg-neutral-700 flex items-center justify-center">
                  <span className="font-body text-white text-xs font-semibold">
                    {getInitials(agent.name)}
                  </span>
                </div>
                <div className="ml-3">
                  <span className="block text-sm font-semibold font-body text-white">
                    {agent.name}
                  </span>
                  <div className="flex items-center gap-1">
                    <div
                      className={`w-2 h-2 rounded-full ${getStatusColor(agent.status)}`}
                      aria-hidden="true"
                    />
                    <span className="text-xs font-body text-neutral-400 capitalize">
                      {agent.status}
                    </span>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Today's Progress */}
        <div
          className="bg-surface p-4 mb-6 rounded-organic-card shadow-organic-card"
          style={{ transform: 'rotate(0.2deg)' }}
        >
          <div className="flex justify-between items-center mb-3">
            <span className="font-body font-semibold text-white">Today&apos;s Progress</span>
            <span className="text-xs font-body font-medium text-teal-400 bg-teal-600/20 px-2 py-0.5 rounded-organic-badge">
              {completedToday} done
            </span>
          </div>
          <ProgressBar
            value={
              completedToday + pendingTasks > 0
                ? (completedToday / (completedToday + pendingTasks)) * 100
                : 0
            }
            color="secondary"
          />
        </div>

        {/* Recent Activity */}
        <div>
          <div className="flex justify-between items-center mb-4">
            <h2 className="font-body font-semibold text-white text-lg">Recent Activity</h2>
            <button
              type="button"
              className="text-sm font-body text-coral-500 hover:text-coral-400 transition-colors"
            >
              See All &rarr;
            </button>
          </div>

          <div className="flex flex-col gap-2">
            {recentActivity.map((activity) => (
              <div
                key={activity.id}
                className="bg-surface p-4 flex rounded-organic-card shadow-organic-card"
              >
                <div className="w-10 h-10 bg-charcoal flex items-center justify-center mr-3 rounded-organic-button">
                  <ActivityIcon type={activity.type} />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-body text-white">{activity.message}</p>
                  <div className="flex gap-2 mt-1">
                    <span className="text-xs font-body text-teal-400">{activity.agent}</span>
                    <span className="text-xs font-body text-neutral-500">&bull;</span>
                    <span className="text-xs font-body text-neutral-500">{activity.project}</span>
                    <span className="text-xs font-body text-neutral-500">&bull;</span>
                    <span className="text-xs font-body text-neutral-500">{activity.time}</span>
                  </div>
                </div>
              </div>
            ))}

            {recentActivity.length === 0 && (
              <div className="text-center py-8">
                <p className="text-neutral-500 font-body text-sm">No recent activity yet.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
