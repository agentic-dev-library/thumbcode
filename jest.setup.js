// Note: @testing-library/jest-native is deprecated.
// React Native Testing Library v12.4+ auto-extends Jest matchers.

// Mock AsyncStorage for Zustand persistence
jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock')
);

// Mock expo-secure-store
jest.mock('expo-secure-store', () => ({
  getItemAsync: jest.fn(),
  setItemAsync: jest.fn(),
  deleteItemAsync: jest.fn(),
}));

// Mock expo-router
jest.mock('expo-router', () => ({
  useRouter: jest.fn(),
  useLocalSearchParams: jest.fn(),
  router: {
    push: jest.fn(),
    replace: jest.fn(),
    back: jest.fn(),
  },
}));

// Mock react-native-reanimated
jest.mock('react-native-reanimated', () => {
  const Reanimated = require('react-native-reanimated/mock');
  Reanimated.default.call = () => {};
  return Reanimated;
});

// Silence the warning: Animated: `useNativeDriver` is not supported
// Note: NativeAnimatedHelper was removed in React Native 0.76+
// Use this alternative mock for NativeAnimatedModule
jest.mock('react-native/Libraries/Animated/NativeAnimatedModule', () => ({
  default: {},
  __esModule: true,
}));
