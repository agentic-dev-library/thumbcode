import * as SecureStore from 'expo-secure-store';

export const setCredential = async (key: string, value: string) => {
  await SecureStore.setItemAsync(key, value, {
    requireAuthentication: true,
    keychainService: 'thumbcode',
  });
};

export const getCredential = async (key: string) => {
  return await SecureStore.getItemAsync(key, {
    requireAuthentication: true,
    keychainService: 'thumbcode',
  });
};

export const deleteCredential = async (key: string) => {
  await SecureStore.deleteItemAsync(key, {
    keychainService: 'thumbcode',
  });
};
