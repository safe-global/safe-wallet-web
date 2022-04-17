import type { NextPage } from 'next'
import { useQueryRewrite } from 'services/usePathRewrite'

const Custom404: NextPage = () => {
  const isRedirecting = useQueryRewrite()

  return <main>{!isRedirecting && <h1>404 - Page Not Found</h1>}</main>
}

export default Custom404
