const { WatchIgnorePlugin } = require('webpack');
const path = require('path');
module.exports = {
  entry: {
    index: path.resolve('./src/index.ts'),
  },

  devtool: 'inline-source-map',

  module: {
    rules: [
      {
        test: /\.scss$/,
        use: [
          'style-loader',
          {
            loader: 'typings-for-css-modules-loader',
            options: {
              localIdentName: '[local]__[hash:base64:5]',
              modules: true,
              sass: false,
              namedExport: true,
              camelCase: true,
              sourcemaps: true,
              banner: '// This is a generated file. Changes are likely to result in being overwritten'
            }
          },
          'resolve-url-loader',
          'sass-loader'
        ]
      },
      {
        test: /\.(png|jpg|gif|svg)$/,
        use: [
          {
            loader: 'url-loader',
            options: {
              limit: 8192
            }
          }
        ]
      },
      {
        test: /\.(tsx?)|(jsx)$/,
        exclude: [/node_modules/],
        use: {
          loader: 'babel-loader'
        }
      },
      {
        test: /\.tsx?$/,
        loader: 'tslint-loader',
        options: { /* Loader options go here */ }
      }
    ]
  },

  externals: {
    react: 'umd react',
    '@uifabric/styling': 'umd @uifabric/styling',
    'react-dom': 'umd react-dom',
    'office-ui-fabric-react': 'umd office-ui-fabric-react'
  },

  resolve: {
    extensions: ['.js', '.jsx', '.json', '.ts', '.tsx', '.scss']
  },

  output: {
    path: path.resolve('./built'),
    filename: '[name].js',
    libraryTarget: 'umd',
    library: "[name]",
  },

  plugins: [
    new WatchIgnorePlugin([
      './src/**/*.d.ts'
    ])
  ]
};
