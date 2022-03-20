import { Configuration } from 'webpack'
import { Configuration as DevConf } from 'webpack-dev-server'

import { resolve } from "path";
import * as HtmlWebpackPlugin from "html-webpack-plugin";

const isProduction = process.env.NODE_ENV == "production";

type C = Configuration & DevConf

const config: C = {
  entry: "./src/index.tsx",
  output: {
    path: resolve(__dirname, "dist"),
  },
  // devServer: {
  //   open: true,
  //   host: "localhost",
  // },
  plugins: [
    new HtmlWebpackPlugin({
      template: "public/index.html",
    }),
  ],
  module: {
    rules: [
      {
        test: /\.(ts|tsx)$/i,
        loader: "ts-loader",
        exclude: ["/node_modules/"],
      },
      {
        test: /\.s[ac]ss$/i,
        use: ['style-loader', "css-loader", "sass-loader"],
      },
      {
        test: /\.(eot|svg|ttf|woff|woff2|png|jpg|gif)$/i,
        type: "asset",
      },
    ],
  },
  resolve: {
    extensions: [".tsx", ".ts", ".js"],
  },
};

module.exports = () => {
  if (isProduction) {
    config.mode = "production";

  } else {
    config.mode = "development";
  }
  return config;
};
