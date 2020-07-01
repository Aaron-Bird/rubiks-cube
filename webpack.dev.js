const merge = require('webpack-merge');
const common = require('./webpack.common.js');

module.exports = merge(common, {
  'mode': 'development',
  'devtool': 'eval-source-map',
  'devServer': {
    port: '8000',
    host: '0.0.0.0',
    public: 'localhost:8000',
    open: false,
    quiet: true,
    contentBase: './public',
    watchContentBase: true,
    hot: true,
  },
  'module': {
    rules: [
      {
        test: /\.s[ac]ss$/i,
        use: [
          'style-loader',
          'css-loader',
          'sass-loader',
        ],
      },
    ],
  },
});
