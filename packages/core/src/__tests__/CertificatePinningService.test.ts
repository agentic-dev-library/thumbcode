import { certificatePinningService } from '../security/CertificatePinningService';

describe('CertificatePinningService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Reset internal state for testing
    (certificatePinningService as any).isInitialized = false;
  });

  it('should initialize successfully on web (no-op)', async () => {
    const consoleSpy = vi.spyOn(console, 'debug').mockImplementation(() => {});
    await certificatePinningService.initialize();
    expect(consoleSpy).toHaveBeenCalledTimes(1);
    consoleSpy.mockRestore();
  });

  it('should not initialize again if already initialized', async () => {
    const consoleSpy = vi.spyOn(console, 'debug').mockImplementation(() => {});
    await certificatePinningService.initialize();
    expect(consoleSpy).toHaveBeenCalledTimes(1);

    await certificatePinningService.initialize();
    expect(consoleSpy).toHaveBeenCalledTimes(1); // Still 1 -- no second call
    consoleSpy.mockRestore();
  });
});
