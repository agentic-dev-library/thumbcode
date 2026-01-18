module.exports = (api) => {
  api.cache(true);

  // Detect test environment
  const isTest =
    process.env.NODE_ENV === 'test' || typeof process.env.JEST_WORKER_ID !== 'undefined';

  return {
    presets: [['babel-preset-expo', isTest ? {} : { jsxImportSource: 'nativewind' }]],
    plugins: [
      // Skip NativeWind/CSS Interop and Reanimated plugins during tests
      // Use react-native-css-interop/dist/babel-plugin directly instead of
      // nativewind/babel which returns an invalid plugin wrapper
      ...(!isTest ? ['react-native-css-interop/dist/babel-plugin'] : []),
      ...(!isTest ? ['react-native-reanimated/plugin'] : []),
      [
        'react-native-web',
        {
          testID: 'data-testid',
        },
      ],
    ],
  };
};
