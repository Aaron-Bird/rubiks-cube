const merge = require('webpack-merge');
const common = require('./webpack.common.js');
const FileManagerPlugin = require('filemanager-webpack-plugin');

module.exports = merge(common, {
  'mode': 'production',
  'plugins': [
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
});
