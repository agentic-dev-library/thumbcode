/**
 * ProjectHeader
 *
 * Displays project name, repo URL, branch, agent count, and task count.
 */

import { ArrowLeft, GitBranch, ListTodo, Users } from 'lucide-react';

interface ProjectHeaderProps {
  name: string;
  repoUrl: string;
  currentBranch: string;
  activeAgents: number;
  pendingTasks: number;
  onBack: () => void;
}

export function ProjectHeader({
  name,
  repoUrl,
  currentBranch,
  activeAgents,
  pendingTasks,
  onBack,
}: Readonly<ProjectHeaderProps>) {
  return (
    <>
      {/* Back navigation */}
      <div className="px-4 py-3 border-b border-neutral-800">
        <button
          type="button"
          onClick={onBack}
          className="flex items-center gap-2 text-neutral-400 hover:text-white transition-colors font-body"
          aria-label="Go back"
        >
          <ArrowLeft size={18} />
          <span>Back</span>
        </button>
      </div>

      {/* Project info */}
      <div className="px-6 py-5 border-b border-neutral-800">
        <h1 className="text-xl font-bold text-white font-body mb-2">{name}</h1>
        <p className="text-sm text-neutral-500 font-mono mb-3 truncate">{repoUrl}</p>

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
    </>
  );
}
