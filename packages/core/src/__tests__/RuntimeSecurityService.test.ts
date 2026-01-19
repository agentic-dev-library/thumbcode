import { runtimeSecurityService } from '../security/RuntimeSecurityService';
import * as Device from 'expo-device';
import { Alert, BackHandler } from 'react-native';

jest.mock('expo-device');

describe('RuntimeSecurityService', () => {
  let alertSpy: jest.SpyInstance;
  let exitAppSpy: jest.SpyInstance;

  beforeEach(() => {
    runtimeSecurityService._reset();
    // Set up spies on the actual Alert and BackHandler modules
    alertSpy = jest.spyOn(Alert, 'alert').mockImplementation();
    exitAppSpy = jest.spyOn(BackHandler, 'exitApp').mockImplementation();
  });

  afterEach(() => {
    alertSpy.mockRestore();
    exitAppSpy.mockRestore();
  });

  it('should be defined', () => {
    expect(runtimeSecurityService).toBeDefined();
  });

  describe('checkAndHandleRootedStatus', () => {
    it('should not alert or exit if the device is not rooted', async () => {
      (Device.isRootedExperimentalAsync as jest.Mock).mockResolvedValue(false);
      await runtimeSecurityService.checkAndHandleRootedStatus();
      expect(alertSpy).not.toHaveBeenCalled();
      expect(exitAppSpy).not.toHaveBeenCalled();
    });

    it('should alert and exit if the device is rooted', async () => {
      (Device.isRootedExperimentalAsync as jest.Mock).mockResolvedValue(true);

      // Configure Alert.alert to automatically invoke the button's onPress callback
      alertSpy.mockImplementation(
        (
          _title: string,
          _message?: string,
          buttons?: Array<{ onPress?: () => void }>
        ) => {
          if (buttons && buttons[0] && buttons[0].onPress) {
            buttons[0].onPress();
          }
        }
      );

      await runtimeSecurityService.checkAndHandleRootedStatus();

      expect(alertSpy).toHaveBeenCalled();
      expect(exitAppSpy).toHaveBeenCalled();
    });
  });
});
