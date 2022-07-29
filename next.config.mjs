/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  eslint: {
    dirs: ['pages', 'services', 'store', 'components', 'config', 'utils', 'hooks', 'tests'],
  },
  experimental: {
    images: {
      unoptimized: true,
    },
  },
  async rewrites() {
    return [
      {
        source: '/:safe([a-z]+\\:0x[a-fA-F0-9]{40})/:path*',
        destination: '/safe/:path*?safe=:safe',
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
            svgo: true,
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
    return config
  },
}

export default nextConfig
