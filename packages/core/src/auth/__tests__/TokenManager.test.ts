/**
 * TokenManager Tests
 *
 * Tests for post-authentication operations: auth status checking,
 * user info retrieval, and sign out.
 */

vi.mock('../../credentials/CredentialService', () => ({
  CredentialService: {
    retrieve: vi.fn(),
    validateCredential: vi.fn(),
    delete: vi.fn(),
  },
}));

import { TokenManager } from '../TokenManager';
import { CredentialService } from '../../credentials/CredentialService';

const mockFetch = vi.fn();
global.fetch = mockFetch;

const mockCredentialService = CredentialService as Mocked<typeof CredentialService>;

describe('TokenManager', () => {
  let manager: TokenManager;

  beforeEach(() => {
    vi.clearAllMocks();
    manager = new TokenManager();
  });

  describe('isAuthenticated', () => {
    it('should return true when token is valid', async () => {
      mockCredentialService.retrieve.mockResolvedValue({ secret: 'ghp_validtoken' });
      mockCredentialService.validateCredential.mockResolvedValue({ isValid: true });

      const result = await manager.isAuthenticated();

      expect(result).toBe(true);
      expect(mockCredentialService.retrieve).toHaveBeenCalledWith('github');
      expect(mockCredentialService.validateCredential).toHaveBeenCalledWith(
        'github',
        'ghp_validtoken'
      );
    });

    it('should return false when no token stored', async () => {
      mockCredentialService.retrieve.mockResolvedValue({ secret: null });

      const result = await manager.isAuthenticated();

      expect(result).toBe(false);
      expect(mockCredentialService.validateCredential).not.toHaveBeenCalled();
    });

    it('should return false when token is invalid', async () => {
      mockCredentialService.retrieve.mockResolvedValue({ secret: 'ghp_expired' });
      mockCredentialService.validateCredential.mockResolvedValue({ isValid: false });

      const result = await manager.isAuthenticated();

      expect(result).toBe(false);
    });
  });

  describe('getCurrentUser', () => {
    it('should return user info when authenticated', async () => {
      mockCredentialService.retrieve.mockResolvedValue({ secret: 'ghp_token' });
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () =>
          Promise.resolve({
            login: 'testuser',
            name: 'Test User',
            avatar_url: 'https://github.com/avatar.png',
            id: 12345,
          }),
      });

      const user = await manager.getCurrentUser();

      expect(user).toEqual({
        login: 'testuser',
        name: 'Test User',
        avatar_url: 'https://github.com/avatar.png',
        id: 12345,
      });

      expect(mockFetch).toHaveBeenCalledWith(
        'https://api.github.com/user',
        expect.objectContaining({
          headers: {
            Authorization: 'Bearer ghp_token',
            Accept: 'application/vnd.github.v3+json',
          },
        })
      );
    });

    it('should return null when no token stored', async () => {
      mockCredentialService.retrieve.mockResolvedValue({ secret: null });

      const user = await manager.getCurrentUser();

      expect(user).toBeNull();
      expect(mockFetch).not.toHaveBeenCalled();
    });

    it('should return null on API error', async () => {
      mockCredentialService.retrieve.mockResolvedValue({ secret: 'ghp_token' });
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 401,
      });

      const user = await manager.getCurrentUser();

      expect(user).toBeNull();
    });

    it('should return null on network error', async () => {
      mockCredentialService.retrieve.mockResolvedValue({ secret: 'ghp_token' });
      mockFetch.mockRejectedValueOnce(new Error('Network error'));

      const user = await manager.getCurrentUser();

      expect(user).toBeNull();
    });
  });

  describe('signOut', () => {
    it('should delete the GitHub credential', async () => {
      mockCredentialService.delete.mockResolvedValue(true);

      const result = await manager.signOut();

      expect(result).toBe(true);
      expect(mockCredentialService.delete).toHaveBeenCalledWith('github');
    });

    it('should return false if deletion fails', async () => {
      mockCredentialService.delete.mockResolvedValue(false);

      const result = await manager.signOut();

      expect(result).toBe(false);
    });
  });
});
