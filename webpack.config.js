const Webpack = require("webpack");
const CompressionPlugin = require("compression-webpack-plugin");
const CopyPlugin = require("copy-webpack-plugin");
require("dotenv").config();

module.exports = {
  mode: "none",
  devtool: "source-map",
  watch: false,
  watchOptions: {
    aggregateTimeout: 500,
    ignored: ["node_modules"]
  },
  optimization: {
    usedExports: true
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
        MODE: process.env.NODE_ENV,
        APP_NAME: JSON.stringify("Fragio"),
        API_URL: JSON.stringify(process.env.API_URL),
        SOURCE_CODE_URL: JSON.stringify(process.env.SOURCE_CODE_URL),
        ROADMAP_URL: JSON.stringify(process.env.ROADMAP_URL)
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
