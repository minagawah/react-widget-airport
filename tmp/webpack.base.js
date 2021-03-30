const path = require('path');
const webpack = require('webpack');
const APIPlugin = require('webpack/lib/APIPlugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');

module.exports = {
  entry: {
    app: './src/index.jsx',
    worker: './src/worker.js',
  },
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'airport.[name].js?[fullhash]',
    library: ['Airport', '[name]'],
    libraryTarget: 'umd',
  },
  externals: {
    react: 'React',
    React__default: 'window.React',
    'react-dom': 'ReactDOM',
  },
  stats: {
    colors: true,
  },
  optimization: {
    minimize: false,
  },
  resolve: {
    extensions: ['.js', '.jsx'],
    alias: {
      'pixi.js': path.resolve(__dirname, 'src/lib/pixi.js'),
      'pixi.js-stable': path.resolve(__dirname, 'node_modules/pixi.js'),
      'react-pixi$': 'react-pixi-fiber/react-pixi-alias',
      '@': path.join(__dirname, 'src'),
    },
  },
  module: {
    rules: [
      {
        test: /\.m?jsx?$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
        },
      },
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader', 'postcss-loader'],
      },
      {
        test: /\.(png|jpg|gif)$/,
        use: ['file-loader'],
      },
      {
        test: /\.(woff|woff2|eot|ttf|otf)$/,
        use: ['file-loader'],
      },
    ],
  },
  plugins: [
    new CleanWebpackPlugin(),
    new HtmlWebpackPlugin({
      chunks: ['app'],
      template: './src/index.html',
      inject: false,
      minify: { collapseWhitespace: false },
    }),
    // ----------------------------------------------------
    // APIPlugin
    // ----------------------------------------------------
    // For [hash] generated by Webpack can be referred
    // from your runtime app as a special global variable.
    //
    // const worker = new SharedWorker('./my_worker.js')
    // const worker = new SharedWorker(`./my_worker.js?{__webpack_hash__}`)
    new APIPlugin(),
  ],
};
