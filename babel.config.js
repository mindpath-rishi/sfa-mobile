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
    env: {
      production: {
        // Drop debug logging from release bundles; keep warnings/errors for diagnostics.
        plugins: [['transform-remove-console', { exclude: ['error', 'warn'] }]],
      },
    },
  };
};
