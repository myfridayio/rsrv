module.exports = {
  presets: [
       [
         'module:metro-react-native-babel-preset',
        {unstable_transformProfile: 'hermes-stable'},
      ],
     ],
     plugins: [
         [
          'module-resolver',
          {
           alias: {
             'crypto': 'react-native-quick-crypto',
              'stream': 'stream-browserify',
              'buffer': '@craftzdog/react-native-buffer',
            },
          },
        ],
        ],
};
