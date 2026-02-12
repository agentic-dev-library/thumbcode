/**
 * Project Detail Page
 *
 * Production project workspace view backed by @thumbcode/state.
 * Migrated from app/project/[id].tsx (React Native) to web React.
 *
 * Note: File system operations (buildFileTree, GitBranchService, GitCommitService)
 * are not available on web. This page renders the UI structure with store data
 * and placeholder content for file/commit tabs until web-compatible services
 * are wired in.
 */

import { useAgentStore, useProjectStore } from '@thumbcode/state';
import type { AgentTask } from '@thumbcode/state';
import {
  ArrowLeft,
  GitBranch,
  Users,
  ListTodo,
  FolderOpen,
  GitCommitHorizontal,
  FileText,
  Folder,
  ChevronRight,
} from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

type Tab = 'files' | 'commits' | 'tasks' | 'agents';

export function ProjectDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const project = useProjectStore((s) => s.projects.find((p) => p.id === id));
  const workspace = useProjectStore((s) => s.workspace);
  const initWorkspace = useProjectStore((s) => s.initWorkspace);

  const agents = useAgentStore((s) => s.agents);
  const tasks = useAgentStore((s) => s.tasks);

  const [activeTab, setActiveTab] = useState<Tab>('files');

  const scopedTasks = useMemo(() => {
    return tasks;
  }, [tasks]);

  const activeAgents = agents.filter((a) => a.status !== 'idle').length;
  const pendingTasks = scopedTasks.filter(
    (t) => t.status === 'pending' || t.status === 'in_progress',
  ).length;

  useEffect(() => {
    if (!project) return;
    if (!workspace || workspace.projectId !== project.id) {
      initWorkspace(project.id, project.defaultBranch);
    }
  }, [project, workspace, initWorkspace]);

  if (!project) {
    return (
      <div className="flex-1 flex items-center justify-center px-6 bg-charcoal min-h-screen">
        <div className="text-center">
          <h1 className="font-display text-xl text-white mb-2">Project not found</h1>
          <p className="text-neutral-500 mb-6 font-body">
            This project ID doesn't exist locally. Go back and create or select a project.
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

  const currentBranch = workspace?.currentBranch ?? project.defaultBranch;

  return (
    <div className="flex-1 bg-charcoal min-h-screen flex flex-col">
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

      {/* Project Header */}
      <div className="px-6 py-5 border-b border-neutral-800">
        <h1 className="text-xl font-bold text-white font-body mb-2">{project.name}</h1>
        <p className="text-sm text-neutral-500 font-mono mb-3 truncate">{project.repoUrl}</p>

        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex items-center gap-1.5 text-sm text-teal-400 font-body">
            <GitBranch size={14} />
            <span>{currentBranch}</span>
          </div>
          <div className="flex items-center gap-1.5 text-sm text-neutral-400 font-body">
            <Users size={14} />
            <span>{activeAgents} active</span>
          </div>
          <div className="flex items-center gap-1.5 text-sm text-neutral-400 font-body">
            <ListTodo size={14} />
            <span>{pendingTasks} pending</span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-neutral-800">
        {(['files', 'commits', 'tasks', 'agents'] as const).map((tab) => (
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
        {activeTab === 'files' && <FilesTab />}
        {activeTab === 'commits' && <CommitsTab />}
        {activeTab === 'tasks' && <TasksTab tasks={scopedTasks} />}
        {activeTab === 'agents' && <AgentsTab agents={agents} onAgentPress={(agentId) => navigate(`/agent/${agentId}`)} />}
      </div>
    </div>
  );
}

/** Files placeholder -- web file system APIs not yet wired */
function FilesTab() {
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 text-neutral-400 font-body text-sm mb-4">
        <FolderOpen size={16} />
        <span>File Explorer</span>
      </div>
      <div className="bg-surface rounded-organic-card p-6 text-center">
        <Folder size={32} className="text-neutral-600 mx-auto mb-3" />
        <p className="text-neutral-500 font-body text-sm">
          File system access is not yet available on web. Clone operations and file browsing will be enabled in a future update.
        </p>
      </div>
    </div>
  );
}

/** Commits placeholder -- git services not yet wired for web */
function CommitsTab() {
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 text-neutral-400 font-body text-sm mb-4">
        <GitCommitHorizontal size={16} />
        <span>Recent Commits</span>
      </div>
      <div className="bg-surface rounded-organic-card p-6 text-center">
        <GitCommitHorizontal size={32} className="text-neutral-600 mx-auto mb-3" />
        <p className="text-neutral-500 font-body text-sm">
          Commit history will be available once web-compatible Git services are integrated.
        </p>
      </div>
    </div>
  );
}

function TasksTab({ tasks }: { tasks: AgentTask[] }) {
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
          className="bg-surface p-4 rounded-organic-card"
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

function AgentsTab({
  agents,
  onAgentPress,
}: {
  agents: Array<{ id: string; name: string; role: string; status: string }>;
  onAgentPress: (agentId: string) => void;
}) {
  return (
    <div className="space-y-3">
      {agents.map((agent) => (
        <button
          key={agent.id}
          onClick={() => onAgentPress(agent.id)}
          className="w-full bg-surface p-4 rounded-organic-card flex items-center justify-between hover:bg-surface-elevated transition-colors text-left"
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
