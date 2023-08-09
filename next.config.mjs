import path from 'path'
import withBundleAnalyzer from '@next/bundle-analyzer'
import NextPwa from'next-pwa'

const withPWA = NextPwa({
  disable: process.env.NODE_ENV === 'development',
  dest: 'public',
  reloadOnOnline: false,
  /* Do not precache anything */
  publicExcludes: ['**/*'],
  buildExcludes: [/./],
})

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  productionBrowserSourceMaps: true,
  eslint: {
    dirs: ['src'],
  },
  experimental: {
    images: {
      unoptimized: true,
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
  },
  async rewrites() {
    return [
      {
        source: '/:safe([a-z0-9-]+\\:0x[a-fA-F0-9]{40})/:path*',
        destination: '/:path*?safe=:safe',
      },
    ]
  },
  webpack(config) {
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
})(withPWA(nextConfig))
