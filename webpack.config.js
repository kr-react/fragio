const Webpack = require("webpack");
const CompressionPlugin = require("compression-webpack-plugin");
const CopyPlugin = require("copy-webpack-plugin");
require("dotenv").config();

module.exports = {
  mode: "none",
  optimization: {
    usedExports: true
  },
  devtool: "source-map",
  watch: false,
  watchOptions: {
    aggregateTimeout: 600,
    ignored: ["node_modules"]
  },
  output: {
    pathinfo: false
  },
  resolve: {
    extensions: [".js", ".ts", ".tsx"],
    alias: {
      ['~']: __dirname
    }
  },
  module: {
    rules: [
      {
        test: /\.(s*)css$/,
        use: ["style-loader", "css-loader", "sass-loader"]
      },
      {
        test: /\.ts(x?)$/,
        exclude: /node_modules/,
        use: [
          {
            loader: "ts-loader",
            options: {
              transpileOnly: true,
              experimentalWatchApi: true,
            },
          }
        ]
      },
      {
        enforce: "pre",
        test: /\.js$/,
        loader: "source-map-loader"
      }
    ]
  },
  externals: {
    "react": "React",
    "react-dom": "ReactDOM"
  },
  plugins: [
    new Webpack.DefinePlugin({
      'process.env': {
        PORT: JSON.stringify(process.env.PORT),
        API_URL: JSON.stringify(process.env.API_URL),
        APP_NAME: JSON.stringify(process.env.APP_NAME)
      }
    }),
    new CopyPlugin([
      {
        from: "./node_modules/react/umd/react.production.min.js",
        to: "./modules/"
      },
      {
        from: "./node_modules/react-dom/umd/react-dom.production.min.js",
        to: "./modules/"
      }
    ]),
    new CompressionPlugin({
      test: /\.(t|j)s(x?)(\.map)?$/i,
      cache: true,
      algorithm: "gzip",
      filename: '[path].gz[query]',
      compressionOptions: {
        level: 9
      },
      deleteOriginalAssets: false,
    }),
    new CompressionPlugin({
      test: /\.(t|j)s(x?)(\.map)?$/i,
      cache: true,
      algorithm: "brotliCompress",
      filename: '[path].br[query]',
      compressionOptions: {
        level: 11
      },
      deleteOriginalAssets: false,
    })
  ]
};
