import httpProxy from 'http-proxy'

export const config = {
  api: {
    // Enable `externalResolver` option in Next.js
    externalResolver: true,
    bodyParser: false,
  },
}

// eslint-disable-next-line import/no-anonymous-default-export
export default (req: any, res: any) =>
  new Promise((resolve, reject) => {
    const proxy: httpProxy = httpProxy.createProxy()
    proxy.once('proxyReq', (...args) => {
      if (args.length > 0) {
        const [req] = args as any[]
        req.path = req.path.replace('/api', '')
        console.log('PROXYING - ', req.path)
      }
    })
    proxy
      .once('proxyRes', resolve as any)
      .once('error', reject)
      .web(req, res, {
        changeOrigin: true,
        target: process.env.API_URL,
      })
  })
