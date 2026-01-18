/**
 * Runtime Security Service
 *
 * Provides checks for the security of the runtime environment,
 * such as detecting rooted or jailbroken devices.
 */
import * as Device from 'expo-device';
import { Alert, BackHandler } from 'react-native';

class RuntimeSecurityService {
  private hasChecked = false;

  /**
   * (For testing purposes only) Resets the `hasChecked` flag.
   */
  _reset() {
    this.hasChecked = false;
  }

  /**
   * Checks if the device is rooted or jailbroken and takes appropriate action.
   * This check is performed only once per application session.
   */
  async checkAndHandleRootedStatus(): Promise<void> {
    if (this.hasChecked) {
      return;
    }
    this.hasChecked = true;

    try {
      const isRooted = await Device.isRootedExperimentalAsync();

      if (isRooted) {
        Alert.alert(
          'Security Alert',
          'This application cannot be run on a rooted or jailbroken device for security reasons. The app will now exit.',
          [{ text: 'OK', onPress: () => BackHandler.exitApp() }],
          { cancelable: false }
        );
      }
    } catch (error) {
      console.error('Failed to perform root detection check:', error);
    }
  }
}

export const runtimeSecurityService = new RuntimeSecurityService();
