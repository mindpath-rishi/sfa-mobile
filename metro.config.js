// metro.config.js
const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// expo-sqlite loads its web worker's WebAssembly binary as an asset.
if (!config.resolver.assetExts.includes('wasm')) {
  config.resolver.assetExts.push('wasm');
}

// Add web-specific resolver
config.resolver.resolveRequest = (context, moduleName, platform) => {
  // Replace react-native-maps with mock on web
  if (platform === 'web' && moduleName === 'react-native-maps') {
    return {
      filePath: require.resolve('./web/react-native-maps.js'),
      type: 'sourceFile',
    };
  }
  return context.resolveRequest(context, moduleName, platform);
};

module.exports = config;
