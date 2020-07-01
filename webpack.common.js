const path = require('path');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const SpeedMeasurePlugin = require('speed-measure-webpack-plugin');
const smp = new SpeedMeasurePlugin();
const ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin');

module.exports = smp.wrap({
  'entry': ['./src/index.ts'],
  'output': {
    filename: 'main.js',
    path: path.resolve(__dirname, 'dist'),
  },
  'plugins': [
    new ForkTsCheckerWebpackPlugin(),
    new webpack.ProgressPlugin(),
    new HtmlWebpackPlugin({
      template: './src/assets/index.html',
      inject: true,
    }),
  ],
  'module': {
    rules: [
      {
        test: /\.(js|jsx|tsx|ts)$/,
        exclude: /node_modules/,
        loader: 'babel-loader',
      },
      {
        test: /\.(png|svg|jpg|gif|webp)$/,
        use: ['file-loader'],
      },
    ],
  },
  'resolve': {
    extensions: ['.tsx', '.ts', '.js'],
  },
});
