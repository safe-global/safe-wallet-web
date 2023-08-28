import path from 'path'
import { InjectManifest } from 'workbox-webpack-plugin'
import withBundleAnalyzer from '@next/bundle-analyzer'

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export', // static site export

  images: {
    unoptimized: true,
  },

  reactStrictMode: false,
  productionBrowserSourceMaps: true,
  eslint: {
    dirs: ['src'],
  },
  modularizeImports: {
    '@mui/material': {
      transform: '@mui/material/{{member}}',
    },
    '@mui/icons-material/?(((\\w*)?/?)*)': {
      transform: '@mui/icons-material/{{ matches.[1] }}/{{member}}',
    },
    lodash: {
      transform: 'lodash/{{member}}',
    },
    'date-fns': {
      transform: 'date-fns/{{member}}',
    },
  },
  webpack(config, context) {
    config.module.rules.push({
      test: /\.svg$/i,
      issuer: { and: [/\.(js|ts|md)x?$/] },
      use: [
        {
          loader: '@svgr/webpack',
          options: {
            prettier: false,
            svgo: false,
            svgoConfig: {
              plugins: [
                {
                  name: 'preset-default',
                  params: {
                    overrides: { removeViewBox: false },
                  },
                },
              ],
            },
            titleProp: true,
          },
        },
      ],
    })

    // Enable hot reloading/compilation of the Firebase service worker in Typescript
    // @see https://github.com/vercel/next.js/issues/33863#issuecomment-1140518693
    if (!context.isServer) {
      const swSrc = path.join(context.dir, 'public', '/firebase-messaging-sw.ts')
      const swDest = path.join(context.dir, 'public', '/firebase-messaging-sw.js')

      const workboxPlugin = new InjectManifest({
        swSrc,
        swDest,
        include: ['__nothing__'],
      })

      if (context.dev) {
        // Suppress the "InjectManifest has been called multiple times" warning by reaching into
        // the private properties of the plugin and making sure it never ends up in the state
        // where it makes that warning.
        // https://github.com/GoogleChrome/workbox/blob/v6/packages/workbox-webpack-plugin/src/inject-manifest.ts#L260-L282
        // @see https://github.com/GoogleChrome/workbox/issues/1790#issuecomment-1241356293
        Object.defineProperty(workboxPlugin, 'alreadyCalled', {
          get() {
            return false
          },
          set() {
            // do nothing; the internals try to set it to true, which then results in a warning
            // on the next run of webpack.
          },
        })
      }

      config.plugins.push(workboxPlugin)
    }

    config.resolve.alias = {
      ...config.resolve.alias,
      'bn.js': path.resolve('./node_modules/bn.js/lib/bn.js'),
      'mainnet.json': path.resolve('./node_modules/@ethereumjs/common/dist.browser/genesisStates/mainnet.json'),
    }

    return config
  },
}

export default withBundleAnalyzer({
  enabled: process.env.ANALYZE === 'true',
})(nextConfig)
