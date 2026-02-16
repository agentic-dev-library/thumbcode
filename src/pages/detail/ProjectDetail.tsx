/**
 * Project Detail Page
 *
 * Production project workspace view backed by @thumbcode/state.
 * Migrated from app/project/[id].tsx (React Native) to web React.
 *
 * FilesTab and CommitsTab fetch from GitHub API for web-compatible
 * repository browsing without local git clone.
 */

import type { GitHubCommit, GitHubContent } from '@thumbcode/core';
import { GitHubApiService } from '@thumbcode/core';
import type { AgentTask } from '@thumbcode/state';
import { useAgentStore, useProjectStore } from '@thumbcode/state';
import {
  ArrowLeft,
  ChevronRight,
  FileText,
  Folder,
  FolderOpen,
  GitBranch,
  GitCommitHorizontal,
  ListTodo,
  Loader2,
  Users,
} from 'lucide-react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

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
    (t) => t.status === 'pending' || t.status === 'in_progress'
  ).length;

  const currentBranch = workspace?.currentBranch ?? project?.defaultBranch ?? 'main';

  // Parse owner/repo from cloneUrl (e.g. "https://github.com/owner/repo.git")
  const repoInfo = useMemo(() => {
    if (!project) return null;
    const match = project.repoUrl.match(/github\.com[/:]([^/]+)\/([^/.]+)/);
    if (match) return { owner: match[1], repo: match[2] };
    return null;
  }, [project]);

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
    <div className="flex-1 bg-charcoal min-h-screen flex flex-col">
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
        {activeTab === 'files' && <FilesTab repoInfo={repoInfo} branch={currentBranch} />}
        {activeTab === 'commits' && <CommitsTab repoInfo={repoInfo} branch={currentBranch} />}
        {activeTab === 'tasks' && <TasksTab tasks={scopedTasks} />}
        {activeTab === 'agents' && (
          <AgentsTab agents={agents} onAgentPress={(agentId) => navigate(`/agent/${agentId}`)} />
        )}
      </div>
    </div>
  );
}

interface RepoInfoProps {
  repoInfo: { owner: string; repo: string } | null;
  branch: string;
}

function FilesTab({ repoInfo, branch }: RepoInfoProps) {
  const [contents, setContents] = useState<GitHubContent[]>([]);
  const [currentPath, setCurrentPath] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const requestIdRef = useRef(0);

  const fetchContents = useCallback(
    async (path: string) => {
      if (!repoInfo) return;
      const requestId = ++requestIdRef.current;
      setIsLoading(true);
      setError(null);
      try {
        const data = await GitHubApiService.getContents(
          repoInfo.owner,
          repoInfo.repo,
          path || undefined,
          branch
        );
        // Only update state if this is still the latest request
        if (requestId !== requestIdRef.current) return;
        setContents(data);
        setCurrentPath(path);
      } catch (err) {
        if (requestId !== requestIdRef.current) return;
        setError(err instanceof Error ? err.message : 'Failed to load files');
      } finally {
        if (requestId === requestIdRef.current) {
          setIsLoading(false);
        }
      }
    },
    [repoInfo, branch]
  );

  useEffect(() => {
    fetchContents('');
  }, [fetchContents]);

  if (!repoInfo) {
    return (
      <div className="bg-surface rounded-organic-card shadow-organic-card p-6 text-center">
        <Folder size={32} className="text-neutral-600 mx-auto mb-3" />
        <p className="text-neutral-500 font-body text-sm">
          Could not parse repository info from URL.
        </p>
      </div>
    );
  }

  const parentPath = currentPath.includes('/')
    ? currentPath.substring(0, currentPath.lastIndexOf('/'))
    : '';

  // Sort: directories first, then files, alphabetically
  const sorted = [...contents].sort((a, b) => {
    if (a.type !== b.type) return a.type === 'dir' ? -1 : 1;
    return a.name.localeCompare(b.name);
  });

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 text-neutral-400 font-body text-sm mb-4">
        <FolderOpen size={16} />
        <span>{currentPath || 'Root'}</span>
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

      {!isLoading && !error && (
        <div className="space-y-1">
          {currentPath && (
            <button
              type="button"
              onClick={() => fetchContents(parentPath)}
              className="w-full flex items-center gap-3 px-3 py-2 rounded-organic-card hover:bg-surface-elevated transition-colors text-left"
            >
              <Folder size={16} className="text-teal-400 shrink-0" />
              <span className="font-body text-sm text-neutral-300">..</span>
            </button>
          )}
          {sorted.map((item) => (
            <button
              type="button"
              key={item.sha}
              onClick={() => {
                if (item.type === 'dir') fetchContents(item.path);
              }}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-organic-card transition-colors text-left ${
                item.type === 'dir' ? 'hover:bg-surface-elevated cursor-pointer' : 'cursor-default'
              }`}
            >
              {item.type === 'dir' ? (
                <Folder size={16} className="text-teal-400 shrink-0" />
              ) : (
                <FileText size={16} className="text-neutral-500 shrink-0" />
              )}
              <span className="font-body text-sm text-white truncate">{item.name}</span>
              {item.type === 'file' && item.size > 0 && (
                <span className="font-mono text-xs text-neutral-600 ml-auto shrink-0">
                  {item.size > 1024 ? `${(item.size / 1024).toFixed(1)}KB` : `${item.size}B`}
                </span>
              )}
            </button>
          ))}
          {sorted.length === 0 && (
            <p className="text-neutral-500 font-body text-sm text-center py-4">Empty directory</p>
          )}
        </div>
      )}
    </div>
  );
}

function useCommits(repoInfo: RepoInfoProps['repoInfo'], branch: string) {
  const [commits, setCommits] = useState<GitHubCommit[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!repoInfo) return;
    let cancelled = false;

    const load = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const data = await GitHubApiService.listCommits(repoInfo.owner, repoInfo.repo, {
          sha: branch,
          perPage: 30,
        });
        if (!cancelled) setCommits(data);
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Failed to load commits');
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };

    load();
    return () => {
      cancelled = true;
    };
  }, [repoInfo, branch]);

  return { commits, isLoading, error };
}

function CommitsTab({ repoInfo, branch }: RepoInfoProps) {
  const { commits, isLoading, error } = useCommits(repoInfo, branch);

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
