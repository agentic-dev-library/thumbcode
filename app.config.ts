/**
 * Expo App Configuration
 *
 * This dynamic config replaces app.json and provides:
 * - Environment-specific configuration (dev/staging/prod)
 * - Type-safe environment variable access
 * - Automatic environment detection
 *
 * @see https://docs.expo.dev/workflow/configuration/
 */

import type { ConfigContext, ExpoConfig } from 'expo/config';

// Environment types
type AppEnvironment = 'development' | 'staging' | 'production';

// Get environment from EXPO_PUBLIC_APP_ENV or default to development
const getAppEnvironment = (): AppEnvironment => {
  const env = process.env.EXPO_PUBLIC_APP_ENV;
  if (env === 'staging' || env === 'production') {
    return env;
  }
  return 'development';
};

// Environment-specific configuration
const envConfig = {
  development: {
    name: 'ThumbCode Dev',
    slug: 'thumbcode-dev',
    scheme: 'thumbcode-dev',
    icon: './assets/icon.png',
    splash: {
      backgroundColor: '#FEF8F0',
    },
    enableDevTools: true,
  },
  staging: {
    name: 'ThumbCode Staging',
    slug: 'thumbcode-staging',
    scheme: 'thumbcode-staging',
    icon: './assets/icon.png',
    splash: {
      backgroundColor: '#FEF8F0',
    },
    enableDevTools: true,
  },
  production: {
    name: 'ThumbCode',
    slug: 'thumbcode',
    scheme: 'thumbcode',
    icon: './assets/icon.png',
    splash: {
      backgroundColor: '#FEF8F0',
    },
    enableDevTools: false,
  },
} as const;

export default ({ config }: ConfigContext): ExpoConfig => {
  const appEnv = getAppEnvironment();
  const envSettings = envConfig[appEnv];

  return {
    ...config,
    name: envSettings.name,
    slug: envSettings.slug,
    version: '0.1.0',
    orientation: 'portrait',
    icon: envSettings.icon,
    scheme: envSettings.scheme,
    userInterfaceStyle: 'automatic',
    newArchEnabled: true,

    splash: {
      image: './assets/splash.png',
      resizeMode: 'contain',
      backgroundColor: envSettings.splash.backgroundColor,
    },

    assetBundlePatterns: ['**/*'],

    ios: {
      supportsTablet: true,
      bundleIdentifier:
        appEnv === 'production' ? 'com.thumbcode.app' : `com.thumbcode.app.${appEnv}`,
      buildNumber: '1',
      // Permission Review: Biometric permissions are essential for securing user credentials.
      infoPlist: {
        NSFaceIDUsageDescription: 'ThumbCode uses Face ID to secure your API keys and credentials.',
        ITSAppUsesNonExemptEncryption: false,
      },
    },

    android: {
      adaptiveIcon: {
        foregroundImage: './assets/adaptive-icon.png',
        backgroundColor: envSettings.splash.backgroundColor,
      },
      package: appEnv === 'production' ? 'com.thumbcode.app' : `com.thumbcode.app.${appEnv}`,
      versionCode: 1,
      // Permission Review: Biometric permissions are essential for securing user credentials.
      permissions: ['USE_BIOMETRIC', 'USE_FINGERPRINT'],
    },

    web: {
      bundler: 'metro',
      output: 'static',
      favicon: './assets/favicon.png',
    },

    plugins: [
      'expo-router',
      'expo-secure-store',
      [
        'expo-local-authentication',
        {
          faceIDPermission: 'Allow ThumbCode to use Face ID to secure your credentials.',
        },
      ],
    ],

    experiments: {
      typedRoutes: true,
    },

    extra: {
      // Runtime environment flags
      appEnv,
      enableDevTools: envSettings.enableDevTools,

      // Router configuration
      router: {
        origin: false,
      },

      // EAS configuration
      eas: {
        projectId: process.env.EXPO_PROJECT_ID || '',
      },

      // Public environment variables (accessible at runtime)
      // These are prefixed with EXPO_PUBLIC_ in .env
      githubClientId: process.env.EXPO_PUBLIC_GITHUB_CLIENT_ID || '',
    },

    owner: process.env.EXPO_OWNER || 'thumbcode',
  };
};
