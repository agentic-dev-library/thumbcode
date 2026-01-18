import { CredentialService } from '../credentials/CredentialService';

describe('CredentialService', () => {
  it('should be defined', () => {
    expect(CredentialService).toBeDefined();
  });

  describe('store', () => {
    it('should reject an invalid Anthropic key', async () => {
      const result = await CredentialService.store('anthropic', 'invalid-key');
      expect(result.isValid).toBe(false);
      expect(result.message).toBe('Invalid credential format');
    });

    it('should reject an invalid OpenAI key', async () => {
      const result = await CredentialService.store('openai', 'invalid-key');
      expect(result.isValid).toBe(false);
      expect(result.message).toBe('Invalid credential format');
    });

    it('should reject an invalid GitHub token', async () => {
      const result = await CredentialService.store('github', 'invalid-token');
      expect(result.isValid).toBe(false);
      expect(result.message).toBe('Invalid credential format');
    });
  });
});
