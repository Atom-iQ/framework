// eslint-disable-next-line @typescript-eslint/no-var-requires
const path = require('path');

module.exports = {
  entry: './_preview/dist/_source-tsx.js',
  module: {
    rules: [
      {
        test: /\.(ts|js)x?$/,
        exclude: /node_modules/,
        loader: 'babel-loader',
      }
    ]
  },
  output: {
    path: path.resolve(__dirname, '_preview/dist'),
    filename: 'main.bundle.js'
  }
};
