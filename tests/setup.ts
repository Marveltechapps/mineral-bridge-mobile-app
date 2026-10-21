/* eslint-env jest */
jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest'),
);

jest.mock(
  'react-native-safe-area-context',
  () => require('react-native-safe-area-context/jest/mock').default,
);

// Infinite decorative loops (spinners, pulses, shimmer) never settle under fake
// timers; tests only need them not to run.
const { Animated } = require('react-native');
Animated.loop = () => ({ start: () => {}, stop: () => {}, reset: () => {} });

// The dev-menu "States" items need the native dev support module.
jest.mock('react-native/Libraries/Utilities/DevSettings', () => ({
  __esModule: true,
  default: { addMenuItem: jest.fn(), reload: jest.fn() },
}));
