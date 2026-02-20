import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.thumbcode.app',
  appName: 'ThumbCode',
  webDir: 'dist',
  server: {
    androidScheme: 'https',
  },
  plugins: {
    SecureStoragePlugin: {
      // capacitor-secure-storage-plugin: hardware-backed keychain/keystore
      accessibility: 'afterFirstUnlock',
    },
    Filesystem: {
      // @capacitor/filesystem: local file operations for git worktrees
      directory: 'Documents',
    },
    BiometricAuth: {
      // @aparajita/capacitor-biometric-auth: biometric unlock for credentials
      allowDeviceCredential: true,
      androidBiometryStrength: 'weak',
    },
  },
};

export default config;
