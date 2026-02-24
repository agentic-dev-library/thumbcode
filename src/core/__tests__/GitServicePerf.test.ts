import fsNode from 'node:fs';
import os from 'node:os';
import path from 'node:path';

// Mock @capacitor/filesystem before importing Git services
const MOCK_DOC_DIR = path.join(os.tmpdir(), 'git-service-perf-root');
if (!fsNode.existsSync(MOCK_DOC_DIR)) {
  fsNode.mkdirSync(MOCK_DOC_DIR, { recursive: true });
}

vi.mock('@capacitor/filesystem', () => {
  const fs = require('node:fs');
  const path = require('node:path');
  const os = require('node:os');

  const MOCK_DOC_DIR = path.join(os.tmpdir(), 'git-service-perf-root');
  if (!fs.existsSync(MOCK_DOC_DIR)) {
    fs.mkdirSync(MOCK_DOC_DIR, { recursive: true });
  }

  return {
    Directory: { Documents: 'DOCUMENTS' },
    Encoding: { UTF8: 'utf8' },
    Filesystem: {
      readFile: vi.fn(async ({ path: filepath, encoding }) => {
        const resolvedPath = filepath;
        const enc = encoding === 'utf8' ? 'utf8' : 'base64';
        const data = await fs.promises.readFile(resolvedPath, { encoding: enc });
        return { data };
      }),
      writeFile: vi.fn(async ({ path: filepath, data, encoding, recursive }) => {
        const resolvedPath = filepath;
        if (recursive) {
          await fs.promises.mkdir(path.dirname(resolvedPath), { recursive: true });
        }
        const content = encoding === 'utf8' ? data : Buffer.from(data, 'base64');
        return fs.promises.writeFile(resolvedPath, content);
      }),
      deleteFile: vi.fn(async ({ path: filepath }) => {
        if (fs.existsSync(filepath)) {
          await fs.promises.unlink(filepath);
        }
      }),
      rmdir: vi.fn(async ({ path: filepath, recursive }) => {
        if (fs.existsSync(filepath)) {
          await fs.promises.rm(filepath, { recursive: recursive ?? false, force: true });
        }
      }),
      readdir: vi.fn(async ({ path: dirpath }) => {
        const entries = await fs.promises.readdir(dirpath);
        return { files: entries.map((name: string) => ({ name })) };
      }),
      mkdir: vi.fn(async ({ path: dirpath, recursive }) => {
        return fs.promises.mkdir(dirpath, { recursive });
      }),
      stat: vi.fn(async ({ path: filepath }) => {
        try {
          const stats = await fs.promises.stat(filepath);
          return {
            type: stats.isDirectory() ? 'directory' : 'file',
            size: stats.size,
            mtime: stats.mtimeMs,
            ctime: stats.ctimeMs,
          };
        } catch {
          throw new Error(`File not found: ${filepath}`);
        }
      }),
    },
  };
});

import { Encoding, Filesystem } from '@capacitor/filesystem';
import { GitCloneService } from '../git/GitCloneService';
import { GitCommitService } from '../git/GitCommitService';
import { GitDiffService } from '../git/GitDiffService';

describe('Git Services Performance', () => {
  const repoName = `perf-repo-${Date.now()}`;
  const repoDir = path.join(MOCK_DOC_DIR, 'repos', repoName);

  beforeAll(async () => {
    // Clean up before starting
    if (fsNode.existsSync(repoDir)) {
      await fsNode.promises.rm(repoDir, { recursive: true, force: true });
    }
  });

  afterAll(async () => {
    // Clean up after finishing
    if (fsNode.existsSync(repoDir)) {
      await fsNode.promises.rm(repoDir, { recursive: true, force: true });
    }
  });

  it('measures diff performance with many files', async () => {
    // 1. Initialize repo
    const initResult = await GitCloneService.init(repoDir);
    if (!initResult.success) {
      console.error('Init failed:', initResult.error);
    }
    expect(initResult.success).toBe(true);

    // 2. Create initial files
    const fileCount = 100;
    const files = [];
    for (let i = 0; i < fileCount; i++) {
      files.push(`file-${i}.txt`);
      await Filesystem.writeFile({
        path: path.join(repoDir, `file-${i}.txt`),
        data: `Initial content for file ${i}\nLine 2\nLine 3`,
        encoding: Encoding.UTF8,
        recursive: true,
      });
    }

    // 3. Stage and commit
    const stage1 = await GitCommitService.stage({ dir: repoDir, filepath: files });
    expect(stage1.success).toBe(true);
    const commit1 = await GitCommitService.commit({
      dir: repoDir,
      message: 'Initial commit',
      author: {
        name: 'Test User',
        email: 'test@example.com',
        timestamp: Math.floor(Date.now() / 1000),
      },
    });
    expect(commit1.success).toBe(true);

    // 4. Modify all files
    for (let i = 0; i < fileCount; i++) {
      await Filesystem.writeFile({
        path: path.join(repoDir, `file-${i}.txt`),
        data: `Initial content for file ${i}\nLine 2 MODIFIED\nLine 3\nLine 4 ADDED`,
        encoding: Encoding.UTF8,
        recursive: true,
      });
    }

    // 5. Stage and commit
    const stage2 = await GitCommitService.stage({ dir: repoDir, filepath: files });
    expect(stage2.success).toBe(true);
    const commit2 = await GitCommitService.commit({
      dir: repoDir,
      message: 'Modify files',
      author: {
        name: 'Test User',
        email: 'test@example.com',
        timestamp: Math.floor(Date.now() / 1000),
      },
    });
    expect(commit2.success).toBe(true);

    expect(commit1.data).not.toBe(commit2.data);

    // 6. Measure diff time
    const start = performance.now();
    const commit1Data = commit1.data;
    const commit2Data = commit2.data;
    expect(commit1Data).toBeDefined();
    expect(commit2Data).toBeDefined();
    const diffResult = await GitDiffService.diff(
      repoDir,
      commit1Data as string,
      commit2Data as string
    );
    const end = performance.now();

    expect(diffResult.success).toBe(true);
    expect(diffResult.data?.files.length).toBe(fileCount);

    console.log(`GitDiffService.diff for ${fileCount} files took ${(end - start).toFixed(2)}ms`);
  }, 30000); // Increase timeout
});
