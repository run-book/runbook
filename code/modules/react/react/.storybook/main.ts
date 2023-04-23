import { StorybookConfig } from "@storybook/react-webpack5";

const config: StorybookConfig = {
  stories: [ '../src/*.stories.@(ts|tsx|mdx)' ],
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
  refs: {
    components: {
      title: 'Components',
      url: 'http://localhost:6001',
    },
    displayOnDemand: {
      title: 'Display On Demand',
      url: 'http://localhost:6002',
    },
    instruments: {
      title: 'Instruments',
      url: 'http://localhost:6003',
    },
    views: {
      title: 'Views',
      url: 'http://localhost:6004',
    }
  },
};


export default config;
