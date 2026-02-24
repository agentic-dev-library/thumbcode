/**
 * useProjectList Hook
 *
 * Manages project search/filter state and derives the filtered project
 * list from @thumbcode/state so the projects page is a thin shell.
 */

import { useCallback, useMemo, useState } from 'react';
import { type Project, selectProjects, useProjectStore } from '@/state';

export interface UseProjectListResult {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  filteredProjects: Project[];
  hasProjects: boolean;
}

export function useProjectList(): UseProjectListResult {
  const projects = useProjectStore(selectProjects);
  const [searchQuery, setSearchQuery] = useState('');

  const handleSetSearchQuery = useCallback((query: string) => {
    setSearchQuery(query);
  }, []);

  const filteredProjects = useMemo(
    () =>
      projects.filter(
        (project) =>
          project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          project.repoUrl.toLowerCase().includes(searchQuery.toLowerCase())
      ),
    [projects, searchQuery]
  );

  return {
    searchQuery,
    setSearchQuery: handleSetSearchQuery,
    filteredProjects,
    hasProjects: projects.length > 0,
  };
}
