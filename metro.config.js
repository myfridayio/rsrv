/**
 * Metro configuration for React Native
 * https://github.com/facebook/react-native
 *
 * @format
 */

module.exports = {
  transformer: {
    getTransformOptions: async () => ({
      transform: {
        experimentalImportSupport: false,
        inlineRequires: true,
      },
    }),
  },
  resolver: {
    sourceExts: ['js', 'jsx', 'ts', 'tsx', 'json'],
    assetExts: ['txt', 'csv', 'png', 'jpg'],
  },
  extraNodeModules: {
    stream: require.resolve('readable-stream'),
    crypto: require.resolve('react-native-crypto-js'),
  },
};
