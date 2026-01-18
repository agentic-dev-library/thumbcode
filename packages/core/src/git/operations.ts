import git from './client';
import * as FileSystem from 'expo-file-system';

const getRepoDir = (repoName: string) => {
  const dir = FileSystem.documentDirectory;
  if (!dir) {
    throw new Error('FileSystem.documentDirectory is null');
  }
  return `${dir}/${repoName}`;
};

export const clone = async (url: string, repoName: string) => {
  return git.clone({
    dir: getRepoDir(repoName),
    url,
    corsProxy: 'https://cors.isomorphic-git.org',
    singleBranch: true,
    depth: 1,
  });
};

export const commit = async (repoName: string, author: { name: string; email: string }, message: string) => {
  const repoDir = getRepoDir(repoName);
  const status = await git.statusMatrix({ dir: repoDir });

  for (const [filepath, head, workdir, stage] of status) {
    if (head === 1 && workdir === 0 && stage !== 0) {
      await git.remove({ dir: repoDir, filepath });
    } else if (workdir > 1 && stage !== 2) {
      await git.add({ dir: repoDir, filepath });
    }
  }

  const sha = await git.commit({
    dir: repoDir,
    author,
    message,
  });
  return sha;
};

export const push = async (repoName: string, token: string) => {
  return git.push({
    dir: getRepoDir(repoName),
    onAuth: () => ({ username: token }),
  });
};

export const status = async (repoName: string) => {
  return git.statusMatrix({
    dir: getRepoDir(repoName),
  });
};

export const diff = async (repoName: string, filepath: string) => {
  const repoDir = getRepoDir(repoName);
  let oldContent = '';
  try {
    const oid = await git.resolveRef({ dir: repoDir, ref: 'HEAD' });
    const { blob } = await git.readBlob({
      dir: repoDir,
      oid,
      filepath,
    });
    oldContent = new TextDecoder().decode(blob);
  } catch (e: any) {
    if (e.name !== 'TreeOrBlobNotFoundError') {
      throw e;
    }
  }

  try {
    const newContent = await FileSystem.readAsStringAsync(
      `${repoDir}/${filepath}`
    );
    return { oldContent, newContent };
  } catch (e) {
    // If the file doesn't exist in the working directory, it means it was deleted.
    return { oldContent, newContent: '' };
  }
};
