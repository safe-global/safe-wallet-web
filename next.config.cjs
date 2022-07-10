/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  eslint: {
    dirs: ['pages', 'services', 'store', 'components', 'config', 'utils', 'hooks', 'tests'],
  },
}

module.exports = nextConfig
