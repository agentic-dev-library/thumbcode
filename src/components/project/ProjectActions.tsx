/**
 * ProjectActions
 *
 * Tab content components for commits, tasks, and agents views
 * in the project detail screen.
 */

import type { GitHubCommit } from '@thumbcode/core';
import type { AgentTask } from '@thumbcode/state';
import { ChevronRight, FileText, GitCommitHorizontal, ListTodo, Loader2 } from 'lucide-react';

/* ─── Commits ─────────────────────────────────── */

interface ProjectCommitsProps {
  repoInfo: { owner: string; repo: string } | null;
  commits: GitHubCommit[];
  isLoading: boolean;
  error: string | null;
}

export function ProjectCommits({
  repoInfo,
  commits,
  isLoading,
  error,
}: Readonly<ProjectCommitsProps>) {
  if (!repoInfo) {
    return (
      <div className="bg-surface rounded-organic-card shadow-organic-card p-6 text-center">
        <GitCommitHorizontal size={32} className="text-neutral-600 mx-auto mb-3" />
        <p className="text-neutral-500 font-body text-sm">
          Could not parse repository info from URL.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 text-neutral-400 font-body text-sm mb-4">
        <GitCommitHorizontal size={16} />
        <span>Recent Commits</span>
      </div>

      {isLoading && (
        <div className="flex items-center justify-center py-8">
          <Loader2 size={24} className="text-neutral-500 animate-spin" />
        </div>
      )}

      {error && (
        <div className="bg-surface rounded-organic-card shadow-organic-card p-6 text-center">
          <p className="text-coral-500 font-body text-sm">{error}</p>
        </div>
      )}

      {!isLoading && !error && commits.length === 0 && (
        <div className="bg-surface rounded-organic-card shadow-organic-card p-6 text-center">
          <GitCommitHorizontal size={32} className="text-neutral-600 mx-auto mb-3" />
          <p className="text-neutral-500 font-body text-sm">No commits found.</p>
        </div>
      )}

      {!isLoading &&
        !error &&
        commits.map((commit) => (
          <div
            key={commit.sha}
            className="bg-surface p-4 rounded-organic-card shadow-organic-card"
            style={{ transform: 'rotate(-0.15deg)' }}
          >
            <div className="flex items-start gap-3">
              <GitCommitHorizontal size={16} className="text-teal-400 shrink-0 mt-0.5" />
              <div className="flex-1 min-w-0">
                <p className="font-body text-sm text-white truncate">
                  {commit.message.split('\n')[0]}
                </p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="font-body text-xs text-neutral-500">{commit.authorName}</span>
                  <span className="font-mono text-xs text-neutral-600">
                    {commit.sha.slice(0, 7)}
                  </span>
                  <span className="font-body text-xs text-neutral-600">
                    {new Date(commit.date).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>
          </div>
        ))}
    </div>
  );
}

/* ─── Tasks ───────────────────────────────────── */

interface ProjectTasksProps {
  tasks: AgentTask[];
}

export function ProjectTasks({ tasks }: Readonly<ProjectTasksProps>) {
  if (tasks.length === 0) {
    return (
      <div className="text-center py-8">
        <ListTodo size={32} className="text-neutral-600 mx-auto mb-3" />
        <p className="text-neutral-500 font-body">No tasks yet.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {tasks.map((task) => (
        <div
          key={task.id}
          className="bg-surface p-4 rounded-organic-card shadow-organic-card"
          style={{ transform: 'rotate(-0.15deg)' }}
        >
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-2 flex-1 min-w-0">
              <FileText size={14} className="text-neutral-500 shrink-0" />
              <span className="text-sm text-white font-body truncate">{task.description}</span>
            </div>
            <span
              className={`inline-flex items-center px-2 py-0.5 text-xs font-medium capitalize rounded-organic-badge ml-2 ${
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
            <p className="text-xs text-neutral-500 font-body mt-1 ml-5">{task.result}</p>
          )}
        </div>
      ))}
    </div>
  );
}

/* ─── Agents ──────────────────────────────────── */

interface ProjectAgentsProps {
  agents: Array<{ id: string; name: string; role: string; status: string }>;
  onAgentPress: (agentId: string) => void;
}

export function ProjectAgents({ agents, onAgentPress }: Readonly<ProjectAgentsProps>) {
  return (
    <div className="space-y-3">
      {agents.map((agent) => (
        <button
          type="button"
          key={agent.id}
          onClick={() => onAgentPress(agent.id)}
          className="w-full bg-surface p-4 rounded-organic-card shadow-organic-card flex items-center justify-between hover:bg-surface-elevated transition-colors text-left"
          style={{ transform: 'rotate(0.15deg)' }}
          data-testid={`agent-${agent.id}`}
        >
          <div className="flex-1 min-w-0">
            <p className="text-white font-body font-medium">{agent.name}</p>
            <p className="text-sm text-neutral-400 font-body capitalize">{agent.role}</p>
          </div>
          <div className="flex items-center gap-2">
            <span
              className={`inline-flex items-center px-2 py-0.5 text-xs font-medium capitalize rounded-organic-badge ${
                agent.status === 'working'
                  ? 'bg-teal-500/20 text-teal-400'
                  : agent.status === 'error'
                    ? 'bg-coral-500/20 text-coral-500'
                    : 'bg-neutral-700/50 text-neutral-400'
              }`}
            >
              {agent.status.replaceAll('_', ' ')}
            </span>
            <ChevronRight size={16} className="text-neutral-600" />
          </div>
        </button>
      ))}
    </div>
  );
}
