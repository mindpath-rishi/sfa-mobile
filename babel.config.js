// module.exports = function (api) {
//   api.cache(true);

//   return {
//     presets: ['babel-preset-expo'],
//     plugins: [
//       [
//         'module-resolver',
//         {
//           root: ['.'],
//           alias: { '@': './src' },
//         },
//       ],
//     ],
//     env: {
//       web: {
//         plugins: [
//           'babel-plugin-transform-import-meta',
//           'react-native-reanimated/plugin',
//           'react-native-worklets/plugin',
//         ],
//       },
//     },
//   };
// };

module.exports = function (api) {
  api.cache(true);

  return {
    presets: ['babel-preset-expo'],
    plugins: [
      [
        'module-resolver',
        {
          root: ['.'],
          alias: {
            '@': './src',
          },
        },
      ],
      // MUST be last
      'react-native-reanimated/plugin',
    ],
  };
};
