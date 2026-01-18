# GitService API

The `GitService` provides Git operations for ThumbCode using [isomorphic-git](https://isomorphic-git.org/), enabling full Git functionality in React Native without native dependencies.

## Overview

```typescript
import { GitService } from '@thumbcode/core';

const gitService = new GitService();
```

## Features

- Full Git operations (clone, commit, push, pull, branch, merge)
- Works entirely in JavaScript (no native Git required)
- Offline-first with sync capabilities
- GitHub authentication via Personal Access Tokens

## Initialization

### Constructor

```typescript
const gitService = new GitService(options?: GitServiceOptions);
```

#### Options

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `fs` | `FS` | `LightningFS` | Filesystem implementation |
| `http` | `HttpClient` | `http` | HTTP client for remote operations |
| `corsProxy` | `string` | - | CORS proxy URL for web |

### Initialize Repository

```typescript
await gitService.initialize(repoPath: string): Promise<void>
```

Sets the working directory for subsequent Git operations.

```typescript
await gitService.initialize('/projects/my-app');
```

## Repository Operations

### Clone

```typescript
await gitService.clone(options: CloneOptions): Promise<void>
```

#### CloneOptions

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| `url` | `string` | Yes | Repository URL |
| `dir` | `string` | Yes | Destination directory |
| `ref` | `string` | No | Branch or tag to checkout |
| `depth` | `number` | No | Shallow clone depth |
| `onProgress` | `Function` | No | Progress callback |

```typescript
await gitService.clone({
  url: 'https://github.com/owner/repo.git',
  dir: '/projects/repo',
  depth: 1,
  onProgress: (progress) => {
    console.log(`${progress.phase}: ${progress.loaded}/${progress.total}`);
  }
});
```

### Status

```typescript
await gitService.status(): Promise<GitStatus>
```

Returns the current repository status.

```typescript
interface GitStatus {
  branch: string;
  ahead: number;
  behind: number;
  modified: string[];
  staged: string[];
  untracked: string[];
  conflicted: string[];
}

const status = await gitService.status();
console.log(`On branch ${status.branch}`);
console.log(`Modified: ${status.modified.length} files`);
```

### Log

```typescript
await gitService.log(options?: LogOptions): Promise<GitCommit[]>
```

```typescript
interface GitCommit {
  oid: string;
  message: string;
  author: {
    name: string;
    email: string;
    timestamp: number;
  };
  parent: string[];
}

const commits = await gitService.log({ depth: 10 });
commits.forEach(commit => {
  console.log(`${commit.oid.slice(0, 7)} ${commit.message}`);
});
```

## Staging and Commits

### Add

```typescript
await gitService.add(filepath: string | string[]): Promise<void>
```

Stages files for commit.

```typescript
// Single file
await gitService.add('src/app.ts');

// Multiple files
await gitService.add(['src/app.ts', 'src/utils.ts']);

// All changes
await gitService.add('.');
```

### Remove

```typescript
await gitService.remove(filepath: string): Promise<void>
```

Removes a file from the index and working tree.

### Commit

```typescript
await gitService.commit(options: CommitOptions): Promise<string>
```

#### CommitOptions

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| `message` | `string` | Yes | Commit message |
| `author` | `Author` | No | Author info |

```typescript
const oid = await gitService.commit({
  message: 'Add new feature\n\nImplemented the user dashboard.',
  author: {
    name: 'ThumbCode User',
    email: 'user@example.com'
  }
});
console.log(`Created commit ${oid}`);
```

## Branch Operations

### List Branches

```typescript
await gitService.listBranches(options?: { remote?: boolean }): Promise<string[]>
```

```typescript
const localBranches = await gitService.listBranches();
const remoteBranches = await gitService.listBranches({ remote: true });
```

### Current Branch

```typescript
await gitService.currentBranch(): Promise<string>
```

### Create Branch

```typescript
await gitService.branch(name: string, options?: BranchOptions): Promise<void>
```

```typescript
await gitService.branch('feature/new-feature', {
  checkout: true // Switch to new branch
});
```

### Checkout

```typescript
await gitService.checkout(ref: string, options?: CheckoutOptions): Promise<void>
```

```typescript
// Switch branch
await gitService.checkout('develop');

// Checkout specific file
await gitService.checkout('main', {
  filepath: 'src/config.ts'
});
```

### Delete Branch

```typescript
await gitService.deleteBranch(name: string, options?: { force?: boolean }): Promise<void>
```

## Remote Operations

### Fetch

```typescript
await gitService.fetch(options?: FetchOptions): Promise<FetchResult>
```

```typescript
const result = await gitService.fetch({
  remote: 'origin',
  onProgress: (progress) => console.log(progress.phase)
});
```

### Pull

```typescript
await gitService.pull(options?: PullOptions): Promise<void>
```

```typescript
await gitService.pull({
  remote: 'origin',
  author: {
    name: 'ThumbCode User',
    email: 'user@example.com'
  }
});
```

### Push

```typescript
await gitService.push(options?: PushOptions): Promise<PushResult>
```

```typescript
await gitService.push({
  remote: 'origin',
  force: false,
  onProgress: (progress) => console.log(progress.phase)
});
```

## Authentication

Git operations requiring authentication use credentials stored via `CredentialService`.

```typescript
import { CredentialService } from '@thumbcode/core';

// Store GitHub token
await CredentialService.store('github', 'ghp_xxxx...');

// Git operations will automatically use the stored token
await gitService.push();
```

### Custom Authentication

```typescript
await gitService.push({
  onAuth: () => ({
    username: 'token',
    password: 'ghp_xxxx...'
  })
});
```

## Merge Operations

### Merge

```typescript
await gitService.merge(options: MergeOptions): Promise<MergeResult>
```

```typescript
const result = await gitService.merge({
  ours: 'main',
  theirs: 'feature/update',
  author: { name: 'User', email: 'user@example.com' }
});

if (result.conflicts.length > 0) {
  console.log('Conflicts detected:', result.conflicts);
}
```

## Diff Operations

### Diff

```typescript
await gitService.diff(options: DiffOptions): Promise<DiffResult>
```

```typescript
const diff = await gitService.diff({
  oldRef: 'HEAD~1',
  newRef: 'HEAD'
});

diff.files.forEach(file => {
  console.log(`${file.path}: +${file.additions} -${file.deletions}`);
});
```

## Error Handling

```typescript
import { GitError, ErrorCodes } from '@thumbcode/core';

try {
  await gitService.push();
} catch (error) {
  if (error instanceof GitError) {
    switch (error.code) {
      case ErrorCodes.AUTH_REQUIRED:
        console.log('Please configure GitHub token');
        break;
      case ErrorCodes.NETWORK_ERROR:
        console.log('Network unavailable');
        break;
      case ErrorCodes.CONFLICT:
        console.log('Merge conflicts detected');
        break;
    }
  }
}
```

## Best Practices

1. **Initialize before operations**: Always call `initialize()` with the repo path before other operations.

2. **Handle offline gracefully**: Remote operations may fail when offline. Queue them for later.

3. **Use shallow clones**: For large repos, use `depth: 1` to reduce clone time and storage.

4. **Progress callbacks**: Provide progress callbacks for long operations to update UI.

5. **Batch commits**: Avoid many small commits. Batch related changes together.

## See Also

- [CredentialService](./credential-service.md) - Secure storage for Git tokens
- [GitHub Integration](../integrations/github.md) - Setting up GitHub access
