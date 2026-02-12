/**
 * Token Manager
 *
 * Handles post-authentication operations: checking auth status,
 * retrieving user info, and signing out.
 */

import { CredentialService } from '../credentials';
import type { GitHubUser } from './types';

export class TokenManager {
  /**
   * Check if user is currently authenticated with GitHub
   */
  async isAuthenticated(): Promise<boolean> {
    const { secret } = await CredentialService.retrieve('github');
    if (!secret) return false;

    const validation = await CredentialService.validateCredential('github', secret);
    return validation.isValid;
  }

  /**
   * Get the current GitHub user info
   */
  async getCurrentUser(): Promise<GitHubUser | null> {
    const { secret } = await CredentialService.retrieve('github');
    if (!secret) return null;

    try {
      const response = await fetch('https://api.github.com/user', {
        headers: {
          Authorization: `Bearer ${secret}`,
          Accept: 'application/vnd.github.v3+json',
        },
      });

      if (!response.ok) return null;

      const user = await response.json();
      return {
        login: user.login,
        name: user.name,
        avatar_url: user.avatar_url,
        id: user.id,
      };
    } catch {
      return null;
    }
  }

  /**
   * Sign out by removing the stored GitHub token
   */
  async signOut(): Promise<boolean> {
    return CredentialService.delete('github');
  }
}
