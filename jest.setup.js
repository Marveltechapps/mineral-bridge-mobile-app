/* eslint-env jest */
jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock'),
);

/** In-memory Keychain stand-in for unit tests (Android Keystore / iOS Keychain unavailable in Jest). */
jest.mock('react-native-keychain', () => {
  const store = new Map();
  return {
    ACCESSIBLE: { WHEN_UNLOCKED_THIS_DEVICE_ONLY: 'WhenUnlockedThisDeviceOnly' },
    SECURITY_LEVEL: { SECURE_SOFTWARE: 'SECURE_SOFTWARE', SECURE_HARDWARE: 'SECURE_HARDWARE' },
    setGenericPassword: jest.fn(async (username, password, opts = {}) => {
      store.set(opts.service || 'default', { username, password });
      return true;
    }),
    getGenericPassword: jest.fn(async (opts = {}) => {
      const hit = store.get(opts.service || 'default');
      return hit || false;
    }),
    resetGenericPassword: jest.fn(async (opts = {}) => {
      store.delete(opts.service || 'default');
      return true;
    }),
  };
});
