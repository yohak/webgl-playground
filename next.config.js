let path = require("path");

module.exports = {
  webpack: (config, { buildId, dev, isServer, defaultLoaders, webpack }) => {
    // Important: return the modified config
    // console.log(config.plugins);
    config.module.rules.push({
      test: /.(vert|frag|glsl)$/,
      use: "raw-loader",
      include: [path.resolve(__dirname, "src")],
      exclude: /node_modules/,
    });
    return config;
  },
};
