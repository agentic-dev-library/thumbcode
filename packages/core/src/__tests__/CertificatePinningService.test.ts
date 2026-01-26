import { certificatePinningService } from '../security/CertificatePinningService';
import { initializeSslPinning } from 'react-native-ssl-public-key-pinning';

jest.mock('react-native-ssl-public-key-pinning', () => ({
  initializeSslPinning: jest.fn().mockResolvedValue(undefined),
}));

describe('CertificatePinningService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Reset internal state for testing
    (certificatePinningService as any).isInitialized = false;
  });

  it('should initialize SSL pinning successfully', async () => {
    await certificatePinningService.initialize();
    expect(initializeSslPinning).toHaveBeenCalledTimes(1);
  });

  it('should not initialize again if already initialized', async () => {
    await certificatePinningService.initialize();
    expect(initializeSslPinning).toHaveBeenCalledTimes(1);

    await certificatePinningService.initialize();
    expect(initializeSslPinning).toHaveBeenCalledTimes(1);
  });
});
