# Deployment and Release Process

This document outlines the complete deployment and release process for ThumbCode.

## Table of Contents

- [EAS Build Setup](#eas-build-setup)
  - [iOS Provisioning](#ios-provisioning)
  - [Android Keystore](#android-keystore)
  - [Build Profiles](#build-profiles)
- [Release Process](#release-process)
  - [Release Checklist](#release-checklist)
  - [App Store Submission](#app-store-submission)
  - [Versioning Strategy](#versioning-strategy)
- [Environment Configuration](#environment-configuration)
- [Rollback Procedures](#rollback-procedures)
- [Changelog Generation](#changelog-generation)
- [Web Deployment](#web-deployment)
  - [GitHub Pages](#github-pages)
  - [Netlify](#netlify)
- [CI/CD Pipeline](#cicd-pipeline)
- [Troubleshooting Guide](#troubleshooting-guide)

## EAS Build Setup

EAS (Expo Application Services) is used to build and sign the ThumbCode application for both iOS and Android. The configuration is defined in the `eas.json` file.

### iOS Provisioning

EAS handles iOS provisioning (certificates and profiles) automatically. When you run a build for the first time, EAS CLI will prompt you to log in to your Apple Developer account and create the necessary credentials.

The `eas.json` file uses environment variables to link to the correct Apple account and app:

- `EXPO_APPLE_ID`: Your Apple ID email.
- `EXPO_ASC_APP_ID`: Your App Store Connect App ID.
- `EXPO_APPLE_TEAM_ID`: Your Apple Developer Team ID.

These variables should be set in your local environment or as secrets in your CI/CD environment.

### Android Keystore

Similar to iOS, EAS manages the Android keystore. When you first build for Android, EAS generates a new keystore or lets you upload an existing one. This keystore is then stored securely by Expo and used for all subsequent builds.

The `eas.json` file uses an environment variable for the service account key to submit the app to the Play Store:

- `EXPO_ANDROID_SERVICE_ACCOUNT_KEY_PATH`: Path to your Google Cloud service account JSON key.

### Build Profiles

The `eas.json` file defines three build profiles:

- **`development`**: Used for creating development clients. It's configured to build an internal distribution with a development client enabled. For Android, it builds an `.apk` file.
- **`preview`**: Used for creating preview builds for internal testing. It's configured for internal distribution and includes simulator builds for iOS. For Android, it also builds an `.apk` file.
- **`production`**: Used for creating production builds for App Store and Google Play.

## EAS Build Setup

EAS (Expo Application Services) is used to build and sign the ThumbCode application for both iOS and Android. The configuration is defined in the `eas.json` file.

### iOS Provisioning

EAS handles iOS provisioning (certificates and profiles) automatically. When you run a build for the first time, EAS CLI will prompt you to log in to your Apple Developer account and create the necessary credentials.

The `eas.json` file uses environment variables to link to the correct Apple account and app:

- `EXPO_APPLE_ID`: Your Apple ID email.
- `EXPO_ASC_APP_ID`: Your App Store Connect App ID.
- `EXPO_APPLE_TEAM_ID`: Your Apple Developer Team ID.

These variables should be set in your local environment or as secrets in your CI/CD environment.

### Android Keystore

Similar to iOS, EAS manages the Android keystore. When you first build for Android, EAS generates a new keystore or lets you upload an existing one. This keystore is then stored securely by Expo and used for all subsequent builds.

The `eas.json` file uses an environment variable for the service account key to submit the app to the Play Store:

- `EXPO_ANDROID_SERVICE_ACCOUNT_KEY_PATH`: Path to your Google Cloud service account JSON key.

### Build Profiles

The `eas.json` file defines three build profiles:

- **`development`**: Used for creating development clients. It's configured to build an internal distribution with a development client enabled. For Android, it builds an `.apk` file.
- **`preview`**: Used for creating preview builds for internal testing. It's configured for internal distribution and includes simulator builds for iOS. For Android, it also builds an `.apk` file.
- **`production`**: Used for creating production builds for App Store and Google Play.

## EAS Build Setup

EAS (Expo Application Services) is used to build and sign the ThumbCode application for both iOS and Android. The configuration is defined in the `eas.json` file.

### iOS Provisioning

EAS handles iOS provisioning (certificates and profiles) automatically. When you run a build for the first time, EAS CLI will prompt you to log in to your Apple Developer account and create the necessary credentials.

The `eas.json` file uses environment variables to link to the correct Apple account and app:

- `EXPO_APPLE_ID`: Your Apple ID email.
- `EXPO_ASC_APP_ID`: Your App Store Connect App ID.
- `EXPO_APPLE_TEAM_ID`: Your Apple Developer Team ID.

These variables should be set in your local environment or as secrets in your CI/CD environment.

### Android Keystore

Similar to iOS, EAS manages the Android keystore. When you first build for Android, EAS generates a new keystore or lets you upload an existing one. This keystore is then stored securely by Expo and used for all subsequent builds.

The `eas.json` file uses an environment variable for the service account key to submit the app to the Play Store:

- `EXPO_ANDROID_SERVICE_ACCOUNT_KEY_PATH`: Path to your Google Cloud service account JSON key.

### Build Profiles

The `eas.json` file defines three build profiles:

- **`development`**: Used for creating development clients. It's configured to build an internal distribution with a development client enabled. For Android, it builds an `.apk` file.
- **`preview`**: Used for creating preview builds for internal testing. It's configured for internal distribution and includes simulator builds for iOS. For Android, it also builds an `.apk` file.
- **`production`**: Used for creating production builds for App Store and Google Play.
