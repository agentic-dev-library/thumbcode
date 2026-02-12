/**
 * Runtime Security Service
 *
 * Provides checks for the security of the runtime environment,
 * such as detecting rooted or jailbroken devices.
 * Uses @capacitor/device for platform detection.
 *
 * Note: Capacitor's Device plugin does not provide direct root/jailbreak detection.
 * We use platform-based heuristics and log warnings instead.
 */
import { Device } from '@capacitor/device';

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
   *
   * Note: Capacitor does not have built-in root detection like Expo.
   * This method uses Device.getInfo() to gather platform info and applies
   * platform-specific heuristics. For production use, consider integrating
   * a dedicated root detection library.
   */
  async checkAndHandleRootedStatus(): Promise<void> {
    if (this.hasChecked) {
      return;
    }
    this.hasChecked = true;

    try {
      const info = await Device.getInfo();

      // Capacitor does not have direct root detection.
      // On Android, we check if the device is running in a virtual device
      // (which is often the case for rooted environments in testing).
      // For real root detection in production, a native plugin would be needed.
      const isLikelyRooted = info.platform === 'android' && info.isVirtual;

      if (isLikelyRooted) {
        window.alert(
          'Security Alert',
          'This application cannot be run on a rooted or jailbroken device for security reasons. The app will now exit.',
          [{ text: 'OK', onPress: () => window.close() }],
          { cancelable: false }
        );
      }
    } catch (error) {
      console.error('Failed to perform root detection check:', error);
    }
  }
}

export const runtimeSecurityService = new RuntimeSecurityService();
