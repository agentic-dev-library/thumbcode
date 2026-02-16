import { API_URLS } from '@thumbcode/config';
import type { Repository } from '@thumbcode/types';
import { CredentialService } from '../credentials';

interface GitHubCommitResponse {
  sha: string;
  commit: {
    message: string;
    author: {
      name: string;
      email: string;
      date: string;
    };
  };
  html_url: string;
}

interface GitHubContentResponse {
  name: string;
  path: string;
  type: 'file' | 'dir' | 'symlink' | 'submodule';
  size: number;
  sha: string;
  html_url: string;
  download_url: string | null;
}

export interface GitHubCommit {
  sha: string;
  message: string;
  authorName: string;
  authorEmail: string;
  date: string;
  url: string;
}

export interface GitHubContent {
  name: string;
  path: string;
  type: 'file' | 'dir';
  size: number;
  sha: string;
  url: string;
  downloadUrl: string | null;
}

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

  async listCommits(
    owner: string,
    repo: string,
    options?: { perPage?: number; sha?: string }
  ): Promise<GitHubCommit[]> {
    const perPage = options?.perPage ?? 30;
    const shaParam = options?.sha ? `&sha=${encodeURIComponent(options.sha)}` : '';

    const commits = await this.request<GitHubCommitResponse[]>(
      `/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/commits?per_page=${perPage}${shaParam}`
    );

    return commits.map((c) => ({
      sha: c.sha,
      message: c.commit.message,
      authorName: c.commit.author.name,
      authorEmail: c.commit.author.email,
      date: c.commit.author.date,
      url: c.html_url,
    }));
  }

  async getContents(
    owner: string,
    repo: string,
    path?: string,
    ref?: string
  ): Promise<GitHubContent[]> {
    const encodedPath = path ? `/${path.split('/').map(encodeURIComponent).join('/')}` : '';
    const refParam = ref ? `?ref=${encodeURIComponent(ref)}` : '';

    const response = await this.request<GitHubContentResponse | GitHubContentResponse[]>(
      `/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/contents${encodedPath}${refParam}`
    );

    // GitHub returns a single object for file paths, array for directories
    const contents = Array.isArray(response) ? response : [response];

    return contents.map((c) => ({
      name: c.name,
      path: c.path,
      type: c.type === 'dir' ? 'dir' : 'file',
      size: c.size,
      sha: c.sha,
      url: c.html_url,
      downloadUrl: c.download_url,
    }));
  }
}

export const GitHubApiService = new GitHubApiServiceClass();

