import path from 'path'
import withBundleAnalyzer from '@next/bundle-analyzer'
import withPWAInit from '@ducanh2912/next-pwa'
import remarkGfm from 'remark-gfm'
import remarkHeadingId from 'remark-heading-id'
import createMDX from '@next/mdx'
import remarkFrontmatter from 'remark-frontmatter'
import remarkMdxFrontmatter from 'remark-mdx-frontmatter'

const SERVICE_WORKERS_PATH = './src/service-workers'

const withPWA = withPWAInit({
  dest: 'public',
  workboxOptions: {
    mode: 'production',
  },
  reloadOnOnline: false,
  /* Do not precache anything */
  publicExcludes: ['**/*'],
  buildExcludes: [/./],
  customWorkerSrc: SERVICE_WORKERS_PATH,
  // Prefer InjectManifest for Web Push
  swSrc: `${SERVICE_WORKERS_PATH}/index.ts`,
})

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export', // static site export

  images: {
    unoptimized: true,
  },

  pageExtensions: ['js', 'jsx', 'md', 'mdx', 'ts', 'tsx'],
  reactStrictMode: false,
  productionBrowserSourceMaps: true,
  eslint: {
    dirs: ['src', 'cypress'],
  },
  experimental: {
    optimizePackageImports: [
      '@mui/material',
      '@mui/icons-material',
      'lodash',
      'date-fns',
      '@sentry/react',
      '@gnosis.pm/zodiac',
    ],
  },
  webpack(config, { dev }) {
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
      'bn.js': path.resolve('../../node_modules/bn.js/lib/bn.js'),
      'mainnet.json': path.resolve('../..node_modules/@ethereumjs/common/dist.browser/genesisStates/mainnet.json'),
      '@mui/material$': path.resolve('./src/components/common/Mui'),
    }

    if (dev) {
      config.optimization.splitChunks = {
        ...config.optimization.splitChunks,
        cacheGroups: {
          ...config.optimization.splitChunks.cacheGroups,
          customModule: {
            test: /[\\/]..[\\/]..[\\/]node_modules[\\/](@safe-global|ethers)[\\/]/,
            name: 'protocol-kit-ethers',
            chunks: 'all',
          },
        },
      }
      config.optimization.minimize = false
    }

    return config
  },
}
const withMDX = createMDX({
  extension: /\.(md|mdx)?$/,
  jsx: true,
  options: {
    remarkPlugins: [remarkFrontmatter, [remarkMdxFrontmatter, { name: 'metadata' }], remarkHeadingId, remarkGfm],
    rehypePlugins: [],
  },
})

export default withBundleAnalyzer({
  enabled: process.env.ANALYZE === 'true',
})(withPWA(withMDX(nextConfig)))
