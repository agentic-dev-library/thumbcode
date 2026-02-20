import { Device } from '@capacitor/device';
import { runtimeSecurityService } from '../security/RuntimeSecurityService';

// @capacitor/device is mocked in vitest.setup.ts

describe('RuntimeSecurityService', () => {
  let alertSpy: MockInstance;
  let closeSpy: MockInstance;

  beforeEach(() => {
    runtimeSecurityService._reset();
    // Set up spies on window.alert and window.close (used by Capacitor build)
    alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {});
    closeSpy = vi.spyOn(window, 'close').mockImplementation(() => {});
  });

  afterEach(() => {
    alertSpy.mockRestore();
    closeSpy.mockRestore();
  });

  it('should be defined', () => {
    expect(runtimeSecurityService).toBeDefined();
  });

  describe('checkAndHandleRootedStatus', () => {
    it('should not alert or exit if the device is not rooted', async () => {
      vi.mocked(Device.getInfo).mockResolvedValue({
        platform: 'android',
        isVirtual: false,
        model: 'Pixel',
        operatingSystem: 'android',
        osVersion: '14',
        manufacturer: 'Google',
        webViewVersion: '120',
      });
      await runtimeSecurityService.checkAndHandleRootedStatus();
      expect(alertSpy).not.toHaveBeenCalled();
      expect(closeSpy).not.toHaveBeenCalled();
    });

    it('should alert if the device appears rooted (virtual Android)', async () => {
      vi.mocked(Device.getInfo).mockResolvedValue({
        platform: 'android',
        isVirtual: true,
        model: 'Emulator',
        operatingSystem: 'android',
        osVersion: '14',
        manufacturer: 'Google',
        webViewVersion: '120',
      });

      await runtimeSecurityService.checkAndHandleRootedStatus();

      expect(alertSpy).toHaveBeenCalled();
    });
  });
});
