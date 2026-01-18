import { runtimeSecurityService } from '../security/RuntimeSecurityService';
import * as Device from 'expo-device';
import { Alert, BackHandler } from 'react-native';

jest.mock('expo-device');
jest.mock('react-native', () => ({
  Alert: {
    alert: jest.fn(),
  },
  BackHandler: {
    exitApp: jest.fn(),
  },
}));

describe('RuntimeSecurityService', () => {
  it('should be defined', () => {
    expect(runtimeSecurityService).toBeDefined();
  });

  describe('checkAndHandleRootedStatus', () => {
    beforeEach(() => {
      runtimeSecurityService._reset();
      jest.clearAllMocks();
    });

    it('should not alert or exit if the device is not rooted', async () => {
      (Device.isRootedExperimentalAsync as jest.Mock).mockResolvedValue(false);
      await runtimeSecurityService.checkAndHandleRootedStatus();
      expect(Alert.alert).not.toHaveBeenCalled();
      expect(BackHandler.exitApp).not.toHaveBeenCalled();
    });

    it('should alert and exit if the device is rooted', async () => {
      (Device.isRootedExperimentalAsync as jest.Mock).mockResolvedValue(true);

      // Mock Alert.alert to capture the onPress callback
      const alertMock = jest.spyOn(Alert, 'alert');
      alertMock.mockImplementation((title, message, buttons) => {
        if (buttons && buttons[0] && buttons[0].onPress) {
          buttons[0].onPress();
        }
      });

      await runtimeSecurityService.checkAndHandleRootedStatus();

      expect(alertMock).toHaveBeenCalled();
      expect(BackHandler.exitApp).toHaveBeenCalled();

      alertMock.mockRestore();
    });
  });
});
