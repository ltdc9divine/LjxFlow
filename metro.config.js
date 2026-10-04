/**
 * Metro configuration for LjxFlow.
 * Handles WASM modules for expo-sqlite on web.
 */
const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Add wasm support for expo-sqlite on web
config.resolver.sourceExts = [...(config.resolver.sourceExts || []), 'wasm', 'cjs'];

module.exports = config;
