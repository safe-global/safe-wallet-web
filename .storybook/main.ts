import type { StorybookConfig as WebStorybookConfig } from '@storybook/react-webpack5'
import type { StorybookConfig as RNStorybookConfig } from '@storybook/react-native'

const isWeb = process.env.STORYBOOK_WEB
import path from 'path'
import TsconfigPathsPlugin from 'tsconfig-paths-webpack-plugin'

let config: WebStorybookConfig | RNStorybookConfig

if (isWeb) {
  config = {
    stories: ['../src/**/*.mdx', '../src/**/*.stories.@(js|jsx|mjs|ts|tsx)'],
    addons: [
      '@storybook/addon-essentials',
      '@storybook/addon-interactions',
      {
        name: '@storybook/addon-react-native-web',
        options: {
          projectRoot: '../',
          modulesToTranspile: [],
        },
      },
      '@storybook/addon-webpack5-compiler-babel',
    ],
    framework: {
      name: '@storybook/react-webpack5',
      options: {},
    },
    webpackFinal: async (config) => {
      if (config.resolve) {
        config.resolve.plugins = [
          ...(config.resolve.plugins || []),
          new TsconfigPathsPlugin({
            extensions: config.resolve.extensions,
          }),
        ]

        config.resolve.alias = {
          ...config.resolve.alias,
          '@': path.resolve(__dirname, '../'),
        }
      }
      return config
    },
  } as WebStorybookConfig
} else {
  config = {
    stories: ['../src/**/*.mdx', '../src/**/*.stories.@(js|jsx|mjs|ts|tsx)'],
    addons: ['@storybook/addon-ondevice-controls', '@storybook/addon-ondevice-actions'],
  } as RNStorybookConfig
}
export default config
