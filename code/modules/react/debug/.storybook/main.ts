import { StorybookConfig } from "@storybook/react-webpack5";

const config = {
  stories: ['../src/*.stories.@(ts|tsx|mdx)'],
  addons: [
    "@storybook/addon-links",
    "@storybook/addon-essentials",
    "@storybook/addon-interactions",
    '@storybook/addon-styling'
  ],
  framework: {
    name: "@storybook/react-webpack5",
    options: {},
  },
  docs: {
    autodocs: "tag",
  },
};


export default config;
