const Webpack = require("webpack");
const CompressionPlugin = require("compression-webpack-plugin");
const CopyPlugin = require("copy-webpack-plugin");
require("dotenv").config();

module.exports = {
  mode: "none",
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
    extensions: [".js", ".ts", ".tsx"]
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
        API_URL: JSON.stringify(process.env.API_URL)
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
      cache: true
    })
  ]
};
