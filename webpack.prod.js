const path = require('path');
const webpack = require('webpack');
const { merge } = require('webpack-merge');
const LicenseWebpackPlugin = require('license-webpack-plugin')
  .LicenseWebpackPlugin;

const base = require('./webpack.base.js');

module.exports = merge(base, {
  mode: 'production',
  plugins: [new LicenseWebpackPlugin()],
  optimization: {
    minimize: true,
  },
  performance: {
    // Exceeds the max size...
    // Default: 244 KiB
    maxEntrypointSize: 921600, // 512000
    maxAssetSize: 921600, // 512000
  },
});
