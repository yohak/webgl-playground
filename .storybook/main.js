module.exports = {
  stories: ["../src/components/**/*.stories.@(tsx|mdx)"],
  addons: [
    "@storybook/addon-controls",
    "@storybook/addon-links",
    "@storybook/addon-backgrounds",
    "@storybook/addon-actions",
    "@storybook/addon-docs",
    "@storybook/addon-a11y",
    "@storybook/addon-viewport",
    "storybook-addon-next-router",
  ],
  babel: async (options) => ({
    plugins: ["@emotion/babel-plugin"],
  }),
};
