/**
 * useProjectActions Hook
 *
 * Provides project-level actions (delete, archive, settings navigation)
 * with integrated navigation side effects. Wraps useProjectStore actions
 * so the page component stays focused on layout.
 */

import { useProjectStore } from '@thumbcode/state';
import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

export interface UseProjectActionsResult {
  deleteProject: (projectId: string) => void;
  archiveProject: (projectId: string) => void;
  openSettings: (projectId: string) => void;
}

export function useProjectActions(): UseProjectActionsResult {
  const removeProject = useProjectStore((s) => s.removeProject);
  const navigate = useNavigate();

  const deleteProject = useCallback(
    (projectId: string) => {
      removeProject(projectId);
      navigate('/');
    },
    [removeProject, navigate]
  );

  const archiveProject = useCallback((projectId: string) => {
    // Archive sets status to idle — a lightweight "soft delete"
    const updateProject = useProjectStore.getState().updateProject;
    updateProject(projectId, { status: 'idle' });
  }, []);

  const openSettings = useCallback(
    (projectId: string) => {
      navigate(`/project/${projectId}/settings`);
    },
    [navigate]
  );

  return { deleteProject, archiveProject, openSettings };
}
