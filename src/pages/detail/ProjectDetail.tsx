/**
 * Project Detail Page
 *
 * Production project workspace view backed by @thumbcode/state.
 * Composes ProjectHeader, ProjectFileExplorer, and ProjectActions
 * with data from useProjectFiles and useProjectCommits hooks.
 */

import { useAgentStore, useProjectStore } from '@thumbcode/state';
import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ProjectAgents,
  ProjectCommits,
  ProjectFileExplorer,
  ProjectFileExplorerEmpty,
  ProjectHeader,
  ProjectTasks,
} from '@/components/project';
import { parseRepoInfo, useProjectCommits, useProjectFiles } from '@/hooks';

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

  const activeAgents = agents.filter((a) => a.status !== 'idle').length;
  const pendingTasks = tasks.filter(
    (t) => t.status === 'pending' || t.status === 'in_progress'
  ).length;

  const currentBranch = workspace?.currentBranch ?? project?.defaultBranch ?? 'main';

  const repoInfo = useMemo(() => {
    if (!project) return null;
    return parseRepoInfo(project.repoUrl);
  }, [project]);

  const files = useProjectFiles(repoInfo, currentBranch);
  const commits = useProjectCommits(repoInfo, currentBranch);

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
      <ProjectHeader
        name={project.name}
        repoUrl={project.repoUrl}
        currentBranch={currentBranch}
        activeAgents={activeAgents}
        pendingTasks={pendingTasks}
        onBack={() => navigate(-1)}
      />

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
        {activeTab === 'files' &&
          (repoInfo ? (
            <ProjectFileExplorer
              contents={files.contents}
              currentPath={files.currentPath}
              parentPath={files.parentPath}
              isLoading={files.isLoading}
              error={files.error}
              onNavigate={files.navigateTo}
            />
          ) : (
            <ProjectFileExplorerEmpty />
          ))}
        {activeTab === 'commits' && (
          <ProjectCommits
            repoInfo={repoInfo}
            commits={commits.commits}
            isLoading={commits.isLoading}
            error={commits.error}
          />
        )}
        {activeTab === 'tasks' && <ProjectTasks tasks={tasks} />}
        {activeTab === 'agents' && (
          <ProjectAgents
            agents={agents}
            onAgentPress={(agentId) => navigate(`/agent/${agentId}`)}
          />
        )}
      </div>
    </div>
  );
}
