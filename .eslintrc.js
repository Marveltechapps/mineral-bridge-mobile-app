module.exports = {
  root: true,
  extends: '@react-native',
  rules: {
    // Selected / unselected colours are derived from app state, mirroring the
    // design's computed styles, so state-dependent values are applied inline.
    'react-native/no-inline-styles': 'off',
  },
};
