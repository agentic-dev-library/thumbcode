/**
 * Project Form Validation
 *
 * Validation logic for the create-project form.
 * Extracted from create-project.tsx inline checks.
 */

import type { RepoListItem } from '@/components/onboarding';

/** Whether the form has enough data to create a project */
export function canCreateProject(projectName: string, selectedRepo: RepoListItem | null): boolean {
  return selectedRepo !== null && projectName.trim().length > 0;
}

/** Whether a new repo name is valid for creation */
export function canCreateRepo(repoName: string, isCreating: boolean): boolean {
  return repoName.trim().length > 0 && !isCreating;
}
