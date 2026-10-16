module.exports = {
  presets: ['module:@react-native/babel-preset'],
  plugins: [
    [
      'module:react-native-dotenv',
      {
        moduleName: '@env',
        path: '.env',
        allowlist: ['API_BASE_URL', 'API_TIMEOUT_MS'],
        safe: false,
        allowUndefined: true,
      },
    ],
  ],
};
