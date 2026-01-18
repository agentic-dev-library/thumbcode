import { requestSigningService } from '../security/RequestSigningService';
import { CredentialService } from '../credentials/CredentialService';

jest.mock('../credentials/CredentialService');

describe('RequestSigningService', () => {
  it('should be defined', () => {
    expect(requestSigningService).toBeDefined();
  });

  describe('signRequest', () => {
    it('should return null if no signing secret is found', async () => {
      (CredentialService.retrieve as jest.Mock).mockResolvedValue({ secret: null });
      const headers = await requestSigningService.signRequest('https://mcp.thumbcode.com/test', 'POST', '{}');
      expect(headers).toBeNull();
    });

    it('should return the correct signing headers', async () => {
      (CredentialService.retrieve as jest.Mock).mockResolvedValue({ secret: 'test-secret' });
      const headers = await requestSigningService.signRequest('https://mcp.thumbcode.com/test', 'POST', '{}');
      expect(headers).toHaveProperty('X-Request-Timestamp');
      expect(headers).toHaveProperty('X-Request-Nonce');
      expect(headers).toHaveProperty('X-Request-Signature');
    });
  });
});
