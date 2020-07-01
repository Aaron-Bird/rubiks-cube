const merge = require('webpack-merge');
const common = require('./webpack.common.js');
const FileManagerPlugin = require('filemanager-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

module.exports = merge(common, {
  'mode': 'production',
  'output': {
    filename: '[name].[chunkhash].js',
  },
  'plugins': [
    new MiniCssExtractPlugin({
      filename: '[name].[chunkhash].css',
      chunkFilename: '[id].[chunkhash].css',
    }),
    new FileManagerPlugin({
      onStart: {
        delete: ['./dist/**'],
      },
      onEnd: {
        copy: [
          {
            source: './public',
            destination: 'dist',
          },
        ],
      },
    }),
  ],
  'module': {
    rules: [
      {
        test: /\.(sa|sc|c)ss$/,
        use: [
          {
            loader: MiniCssExtractPlugin.loader,
            options: {
              hmr: process.env.NODE_ENV === 'development',
            },
          },
          'css-loader',
          'sass-loader',
        ],
      },
    ],
  },
});
