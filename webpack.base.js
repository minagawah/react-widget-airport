const path = require('path');
const webpack = require('webpack');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');

// aconst EXTERNALS = makeExternals([
//   [
//     'core-js',
//     'https://cdnjs.cloudflare.com/ajax/libs/core-js/3.8.0/minified.min.js',
//   ],
//   ['react', 'https://unpkg.com/react@17/umd/react.production.min.js', 'React'],
//   [
//     'react-dom',
//     'https://unpkg.com/react-dom@17/umd/react-dom.production.min.js',
//     'ReactDOM',
//   ],
//   [
//     'pixi',
//     'https://cdnjs.cloudflare.com/ajax/libs/pixi.js/4.4.5/pixi.min.js',
//     'ReactPIXI',
//   ],
//   [
//     'react-pixi-fiber',
//     'https://cdn.jsdelivr.net/npm/react-pixi-fiber@1.0.0-beta.4/umd/react-pixi-alias.production.min.js',
//     'ReactPixiFiber',
//   ],
// ]);

// console.log('EXTERNALS: ', EXTERNALS);

module.exports = {
  entry: {
    app: './src/index.jsx',
    worker: './src/worker.js',
  },
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'airport.[name].js?[hash]',
    library: ['Airport', '[name]'],
    libraryTarget: 'umd',
  },
  // externals: EXTERNALS,
  stats: {
    colors: true,
  },
  resolve: {
    extensions: ['.js', '.jsx'],
    alias: {
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
  plugins: [new CleanWebpackPlugin()],
};

function makeExternals (mapping) {
  return mapping.reduce(
    (acc, [name, url, alt]) => ({
      ...acc,
      [name]: ['commonjs', 'commonjs2', 'amd', 'root'].reduce(
        (acc2, key) => ({
          ...acc2,
          // [key]: [url, key === 'root' ? alt || name : name],
          [key]: key === 'root' ? alt || name : name,
        }),
        {}
      ),
    }),
    {}
  );
}
