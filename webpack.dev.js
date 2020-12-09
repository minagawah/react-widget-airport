/**
 * With "APIPlugin", you get a global variable
 * "__webpack_hash__" in your runtime application
 * to which the generated Webpack [hash] is set.
 * For instance, you usually have to refer
 * to the worker files inline:
 *
 * const worker = new SharedWorker('./my_worker.js')
 *
 * but you could write like this:
 *
 * const worker = new SharedWorker(`./my_worker.js?{__webpack_hash__}`)
 */
const path = require('path');
const webpack = require('webpack');
const { merge } = require('webpack-merge');
// const APIPlugin = require('webpack/lib/APIPlugin');

const base = require('./webpack.base.js');

module.exports = merge(base, {
  mode: 'development',
  devtool: 'inline-cheap-source-map',
  optimization: {
    minimize: false,
  },
  // plugins: [new APIPlugin()],
});
