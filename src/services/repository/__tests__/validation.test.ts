import { describe, expect, it } from 'vitest';
import type { RepoListItem } from '@/components/onboarding';
import { canCreateProject, canCreateRepo } from '../validation';

const makeRepoItem = (overrides: Partial<RepoListItem> = {}): RepoListItem => ({
  key: 'user/test',
  provider: 'github',
  owner: 'user',
  name: 'test',
  fullName: 'user/test',
  defaultBranch: 'main',
  cloneUrl: 'https://github.com/user/test.git',
  isPrivate: false,
  ...overrides,
});

describe('canCreateProject', () => {
  it('returns true when name and repo are provided', () => {
    expect(canCreateProject('My Project', makeRepoItem())).toBe(true);
  });

  it('returns false when project name is empty', () => {
    expect(canCreateProject('', makeRepoItem())).toBe(false);
  });

  it('returns false when project name is whitespace', () => {
    expect(canCreateProject('   ', makeRepoItem())).toBe(false);
  });

  it('returns false when no repo is selected', () => {
    expect(canCreateProject('My Project', null)).toBe(false);
  });

  it('returns false when both are missing', () => {
    expect(canCreateProject('', null)).toBe(false);
  });
});

describe('canCreateRepo', () => {
  it('returns true when name is provided and not creating', () => {
    expect(canCreateRepo('new-repo', false)).toBe(true);
  });

  it('returns false when name is empty', () => {
    expect(canCreateRepo('', false)).toBe(false);
  });

  it('returns false when name is whitespace', () => {
    expect(canCreateRepo('   ', false)).toBe(false);
  });

  it('returns false when already creating', () => {
    expect(canCreateRepo('new-repo', true)).toBe(false);
  });
});
