const path = require("path");
const HTMLWebpackPlugin = require("html-webpack-plugin");
const { CleanWebpackPlugin } = require("clean-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const CopyPlugin = require("copy-webpack-plugin");
const TerserWebpackPlugin = require("terser-webpack-plugin");

const isModeDev = process.env.NODE_ENV === "development";
const isModeProd = process.env.NODE_ENV === "production";

const filename = (extension) =>
  isModeDev ? `[name].${extension}` : `[name].[hash].${extension}`;

const cssLoaders = (loader) => {
  if (isModeProd) {
    return [
      {
        loader: MiniCssExtractPlugin.loader,
        options: {
          hmr: isModeDev,
          reloadAll: true,
        },
      },
      "css-loader",
      "postcss-loader",
      loader,
    ];
  } else {
    return ["style-loader", "css-loader", loader];
  }
};

const optimization = () => {
  const config = {
    splitChunks: {
      chunks: "all",
    },
  };

  if (isModeProd) {
    config.minimize = true;
    config.minimizer = [new TerserWebpackPlugin()];
  }

  return config;
};

module.exports = {
  entry: ["@babel/polyfill", path.resolve(__dirname, "src/index")],
  output: {
    filename: filename("js"),
    path: path.resolve(__dirname, "dist"),
  },
  resolve: {
    extensions: [".tsx", ".ts", ".js", ".jsx"],
    alias: {
      "@": path.resolve(__dirname, "src"),
    },
  },
  devtool: isModeProd ? false : "inline-source-map",
  devServer: {
    contentBase: path.join(__dirname, "dist"),
    port: 3030,
    hot: isModeDev,
  },
  plugins: [
    new CleanWebpackPlugin(),
    new HTMLWebpackPlugin({
      template: path.resolve(__dirname, "src/index.html"),
      filename: "index.html",
      minify: {
        collapseWhitespace: isModeProd,
      },
    }),
    new MiniCssExtractPlugin({
      filename: filename("css"),
    }),
    new CopyPlugin({
      patterns: [
        {
          from: path.resolve(__dirname, "src", "static"),
          to: path.resolve(__dirname, "dist", "static"),
        },
      ],
    }),
  ],
  optimization: optimization(),
  devtool: isModeDev ? "source-map" : "",
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: "/node_modules/",
        loader: "babel-loader",
      },
      {
        test: /\.s[ac]ss$/,
        use: cssLoaders("sass-loader"),
      },
      {
        test: /\.(png|jpg|jpeg|gif)$/,
        use: [
          {
            loader: "file-loader",
            options: {
              name: "static/img/[name].[ext]",
            },
          },
        ],
      },
      {
        test: /\.svg$/,
        use: [
          {
            loader: "file-loader",
            options: {
              name: "static/svg/[name].[ext]",
            },
          },
        ],
      },
      {
        test: /\.(ttf|woff|woff2|eot)$/,
        use: [
          {
            loader: "file-loader",
            options: {
              name: "static/fonts/[name].[ext]",
            },
          },
        ],
      },
    ],
  },
};
