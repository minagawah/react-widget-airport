const path = require('path');
const webpack = require('webpack');
const { merge } = require('webpack-merge');

const base = require('./webpack.base.js');

module.exports = merge(base, {
  mode: 'development',
  devtool: 'inline-cheap-source-map',
  devServer: {
    static: [path.resolve(__dirname, './dist')],
    port: 8080,
  },
  optimization: {
    minimize: false,
  },
});
