import { API_URLS } from '@thumbcode/config';
import type { Repository } from '@thumbcode/types';
import { CredentialService } from '../credentials';

interface GitHubRepoResponse {
  id: number;
  name: string;
  full_name: string;
  owner: { login: string };
  private: boolean;
  description: string | null;
  default_branch: string;
  clone_url: string;
  stargazers_count: number;
  forks_count: number;
  language: string | null;
  updated_at: string;
}

class GitHubApiServiceClass {
  private async getToken(): Promise<string> {
    const { secret } = await CredentialService.retrieve('github');
    if (!secret) {
      throw new Error('Missing GitHub credential. Connect GitHub first.');
    }
    return secret;
  }

  private async request<T>(path: string, init: RequestInit = {}): Promise<T> {
    const token = await this.getToken();
    const url = `${API_URLS.github}${path}`;
    const res = await fetch(url, {
      ...init,
      headers: {
        Accept: 'application/vnd.github.v3+json',
        Authorization: `Bearer ${token}`,
        ...init.headers,
      },
    });

    if (!res.ok) {
      const text = await res.text().catch(() => '');
      throw new Error(`GitHub API error: ${res.status} ${text}`.trim());
    }

    return (await res.json()) as T;
  }

  async listRepositories(options?: {
    perPage?: number;
    sort?: 'updated' | 'created' | 'pushed' | 'full_name';
    affiliation?: string;
  }): Promise<Repository[]> {
    const perPage = options?.perPage ?? 100;
    const sort = options?.sort ?? 'updated';
    const affiliation = options?.affiliation ?? 'owner,collaborator,organization_member';

    const repos = await this.request<GitHubRepoResponse[]>(
      `/user/repos?per_page=${perPage}&sort=${sort}&direction=desc&affiliation=${encodeURIComponent(affiliation)}`
    );

    return repos.map((r) => ({
      provider: 'github',
      owner: r.owner.login,
      name: r.name,
      fullName: r.full_name,
      defaultBranch: r.default_branch,
      cloneUrl: r.clone_url,
      isPrivate: r.private,
      description: r.description ?? undefined,
      language: r.language ?? undefined,
      stars: r.stargazers_count,
      forks: r.forks_count,
      updatedAt: r.updated_at,
    }));
  }

  async createRepository(options: {
    name: string;
    description?: string;
    isPrivate?: boolean;
  }): Promise<Repository> {
    const repo = await this.request<GitHubRepoResponse>('/user/repos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: options.name,
        description: options.description || '',
        private: options.isPrivate ?? true,
        auto_init: true,
      }),
    });

    return {
      provider: 'github',
      owner: repo.owner.login,
      name: repo.name,
      fullName: repo.full_name,
      defaultBranch: repo.default_branch,
      cloneUrl: repo.clone_url,
      isPrivate: repo.private,
      description: repo.description ?? undefined,
      language: repo.language ?? undefined,
      stars: repo.stargazers_count,
      forks: repo.forks_count,
      updatedAt: repo.updated_at,
    };
  }
}

export const GitHubApiService = new GitHubApiServiceClass();

