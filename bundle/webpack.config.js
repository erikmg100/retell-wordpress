const path = require('path');

module.exports = {
  entry: './src/index.js',
  output: {
    filename: 'retell-bundle.js',
    path: path.resolve(__dirname, 'dist'),
    clean: true
  },
  mode: 'production',
  target: 'web',
  resolve: {
    fallback: {
      "buffer": false,
      "stream": false,
      "crypto": false,
      "util": false
    }
  }
};
