/**
 * Projects Screen
 *
 * Lists all projects with search, quick actions, and status.
 * Migrated from React Native to web React with Tailwind CSS.
 */

import { selectProjects, useProjectStore } from '@thumbcode/state';
import { ClipboardList, FolderOpen, GitBranch, Github, Plus, Search, Users } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function getStatusBadge(status: 'active' | 'idle' | 'error') {
  switch (status) {
    case 'active':
      return (
        <span className="text-xs font-body font-medium text-teal-400 bg-teal-600/20 px-2 py-0.5 rounded-organic-badge">
          Active
        </span>
      );
    case 'idle':
      return (
        <span className="text-xs font-body font-medium text-neutral-400 bg-neutral-600 px-2 py-0.5 rounded-organic-badge">
          Idle
        </span>
      );
    case 'error':
      return (
        <span className="text-xs font-body font-medium text-coral-400 bg-coral-500/20 px-2 py-0.5 rounded-organic-badge">
          Error
        </span>
      );
    default:
      return null;
  }
}

export default function ProjectsPage() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');

  const projects = useProjectStore(selectProjects);

  const filteredProjects = projects.filter(
    (project) =>
      project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      project.repoUrl.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex-1 flex flex-col bg-charcoal" data-testid="projects-screen">
      {/* Search */}
      <div className="p-4">
        <div className="bg-surface flex items-center px-4 py-3 rounded-organic-card">
          <Search size={20} className="text-neutral-400 mr-3" aria-hidden="true" />
          <input
            type="text"
            aria-label="Search projects"
            placeholder="Search projects..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1 bg-transparent text-white font-body text-base outline-none placeholder-neutral-400"
          />
        </div>
      </div>

      {/* Project List */}
      <div className="flex-1 overflow-y-auto px-4 pb-24">
        {filteredProjects.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12">
            <FolderOpen size={56} className="text-neutral-600 mb-4" />
            <h2 className="font-display text-lg text-white text-center mb-2">No Projects Found</h2>
            <p className="font-body text-sm text-neutral-400 text-center max-w-[280px] mb-4">
              {searchQuery
                ? 'No projects match your search. Try different keywords.'
                : 'Create your first project to get started with ThumbCode.'}
            </p>
            <button
              type="button"
              onClick={() => navigate('/onboarding/create-project')}
              className="px-4 py-2 bg-coral-500 text-white font-body font-semibold rounded-organic-button hover:bg-coral-600 transition-colors"
            >
              Create Project
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {filteredProjects.map((project, index) => (
              <button
                type="button"
                key={project.id}
                onClick={() => navigate(`/project/${project.id}`)}
                className="bg-surface p-4 rounded-organic-card shadow-organic-card hover:bg-surface-elevated transition-colors text-left"
                style={{ transform: `rotate(${index % 2 === 0 ? '-0.3' : '0.3'}deg)` }}
              >
                {/* Header */}
                <div className="flex justify-between items-start mb-3">
                  <div className="flex-1">
                    <span className="block font-body font-semibold text-white text-lg">
                      {project.name}
                    </span>
                    <span className="text-sm font-body text-neutral-400 truncate block">
                      {project.repoUrl}
                    </span>
                  </div>
                  {getStatusBadge(project.status ?? 'idle')}
                </div>

                {/* Repo Info */}
                <div className="flex gap-4 mb-3">
                  <div className="flex items-center gap-1">
                    <Github size={14} className="text-neutral-400" />
                    <span className="text-sm font-body text-neutral-400">
                      {project.repoUrl.replace(/^https?:\/\//, '')}
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <GitBranch size={14} className="text-neutral-400" />
                    <span className="text-sm font-body text-neutral-400">
                      {project.defaultBranch}
                    </span>
                  </div>
                </div>

                {/* Footer */}
                <div className="flex justify-between items-center">
                  <div className="flex gap-4">
                    <div className="flex items-center gap-1">
                      <ClipboardList size={14} className="text-gold-400" />
                      <span className="text-sm font-body text-neutral-400">Workspace ready</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Users size={14} className="text-teal-500" />
                      <span className="text-sm font-body text-neutral-400">Agents available</span>
                    </div>
                  </div>
                  <span className="text-xs font-body text-neutral-500">
                    Opened {new Date(project.lastOpenedAt).toLocaleDateString()}
                  </span>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* FAB */}
      <button
        type="button"
        onClick={() => navigate('/onboarding/create-project')}
        className="fixed bottom-6 right-6 w-14 h-14 bg-coral-500 flex items-center justify-center rounded-organic-button shadow-organic-float hover:bg-coral-600 transition-colors z-10"
        aria-label="Create new project"
      >
        <Plus size={24} className="text-white" />
      </button>
    </div>
  );
}
