import dynamic from 'next/dynamic'
import '@/styles/globals.css'

const LazyAppWebCoreApp =
  process.env.NEXT_PUBLIC_IS_PRODUCTION === 'true'
    ? require('@/components/App').default
    : dynamic(() => import('@/components/App'), { ssr: false })

export default LazyAppWebCoreApp
