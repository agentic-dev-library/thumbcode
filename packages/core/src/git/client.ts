import git from 'isomorphic-git';
import http from 'isomorphic-git/http/web';
import * as FileSystem from 'expo-file-system';

// @ts-ignore
git.plugins.set('fs', FileSystem);
// @ts-ignore
git.plugins.set('http', http);

export default git;
