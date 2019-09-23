const { BundleAnalyzerPlugin } = require("webpack-bundle-analyzer");
const { ANALYZE } = process.env;
// const path = require("path");

module.exports = {
  distDir: 'release',
  webpack: (config, { dev }) => {
    // Perform customizations to webpack config
    const webpack = require("webpack");
    config.plugins = config.plugins || [];
    config.plugins.push(
      new webpack.ContextReplacementPlugin(/moment[/\\]locale$/, /id/)
    );

    if (ANALYZE) {
      config.plugins.push(
        new BundleAnalyzerPlugin({
          analyzerMode: "server",
          analyzerPort: 8888,
          openAnalyzer: true
        })
      );
    }

    // For the development version, we'll use React.
    // Because, it supports react hot loading and so on.

    // if (dev) {
    //   return config;
    // }

    // config.resolve.alias = {
    //   react: "preact-compat/dist/preact-compat",
    //   "react-dom": "preact-compat/dist/preact-compat",
    //   "create-react-class": "preact-compat/lib/create-react-class"
    // };

    // Important: return the modified config
    // config.resolve.modules = [path.resolve(__dirname, "components"), "node_modules"]
    return config;
  },
  webpackDevMiddleware: config => {
    // Perform customizations to webpack dev middleware config

    // Important: return the modified config
    return config;
  }
};
