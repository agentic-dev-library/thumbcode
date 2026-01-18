module.exports = (api) => {
  api.cache(true);

  // Detect test environment
  const isTest = process.env.NODE_ENV === 'test' || typeof process.env.JEST_WORKER_ID !== 'undefined';

  return {
    presets: [
      ['babel-preset-expo', isTest ? {} : { jsxImportSource: 'nativewind' }]
    ],
    plugins: [
      // Skip NativeWind and Reanimated plugins during tests
      ...(!isTest ? ['nativewind/babel'] : []),
      ...(!isTest ? ['react-native-reanimated/plugin'] : [])
    ]
  };
};
