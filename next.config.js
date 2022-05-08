/** @type {import('next').NextConfig} */
const path = require('path')

const nextConfig = {
  reactStrictMode: false,
  eslint: {
    dirs: ['pages', 'services', 'store', 'components', 'config'],
  },
  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      'bn.js': path.join(__dirname, 'node_modules/bn.js/lib/bn.js'),
    }
    return config
  },
}

module.exports = nextConfig
