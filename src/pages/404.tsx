import type { NextPage } from 'next'
import { use404Rewrite } from '@/hooks/usePathRewrite'

const Custom404: NextPage = () => {
  const isRedirecting = use404Rewrite()

  return <main>{!isRedirecting && <h1>404 - Page Not Found</h1>}</main>
}

export default Custom404
