import '@testing-library/jest-dom';

// Mock capacitor-secure-storage-plugin
vi.mock('capacitor-secure-storage-plugin', () => ({
  SecureStoragePlugin: {
    get: vi.fn().mockResolvedValue({ value: '' }),
    set: vi.fn().mockResolvedValue(undefined),
    remove: vi.fn().mockResolvedValue(undefined),
    keys: vi.fn().mockResolvedValue({ value: [] }),
    clear: vi.fn().mockResolvedValue(undefined),
  },
}));

// Mock @aparajita/capacitor-biometric-auth
vi.mock('@aparajita/capacitor-biometric-auth', () => ({
  BiometricAuth: {
    authenticate: vi.fn().mockResolvedValue(undefined),
    checkBiometry: vi.fn().mockResolvedValue({
      isAvailable: false,
      biometryType: 0,
      reason: '',
    }),
  },
}));

// Mock @capacitor/filesystem
vi.mock('@capacitor/filesystem', () => ({
  Filesystem: {
    readFile: vi.fn().mockResolvedValue({ data: '' }),
    writeFile: vi.fn().mockResolvedValue({ uri: '' }),
    mkdir: vi.fn().mockResolvedValue(undefined),
    rmdir: vi.fn().mockResolvedValue(undefined),
    readdir: vi.fn().mockResolvedValue({ files: [] }),
    deleteFile: vi.fn().mockResolvedValue(undefined),
    stat: vi.fn().mockResolvedValue({ type: 'file', size: 0, uri: '' }),
  },
  Directory: {
    Documents: 'DOCUMENTS',
    Data: 'DATA',
    Cache: 'CACHE',
  },
  Encoding: {
    UTF8: 'utf8',
  },
}));

// Mock @capacitor/device
vi.mock('@capacitor/device', () => ({
  Device: {
    getInfo: vi.fn().mockResolvedValue({
      platform: 'web',
      operatingSystem: 'unknown',
      osVersion: 'unknown',
      model: 'unknown',
      manufacturer: 'unknown',
      isVirtual: false,
      webViewVersion: 'unknown',
    }),
    getId: vi.fn().mockResolvedValue({ identifier: 'test-device-id' }),
    getBatteryInfo: vi.fn().mockResolvedValue({ batteryLevel: 1, isCharging: false }),
  },
}));

// Mock localStorage for Zustand persistence
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: vi.fn((key: string) => store[key] ?? null),
    setItem: vi.fn((key: string, value: string) => {
      store[key] = value;
    }),
    removeItem: vi.fn((key: string) => {
      delete store[key];
    }),
    clear: vi.fn(() => {
      store = {};
    }),
    get length() {
      return Object.keys(store).length;
    },
    key: vi.fn((index: number) => Object.keys(store)[index] ?? null),
  };
})();

Object.defineProperty(window, 'localStorage', { value: localStorageMock });
