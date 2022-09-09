import { useRouter } from 'next/router'
import { useSafeAppUrl } from '@/hooks/safe-apps/useSafeAppUrl'
import { useChainFromQueryParams } from '@/hooks/safe-apps/useChainFromQueryParams'
import { SafeAppLanding } from '@/components/safe-apps/SafeAppLandingPage'

const ShareSafeApp = () => {
  const router = useRouter()
  const [appUrl, routerReady] = useSafeAppUrl()
  const { chain, validChain, loading: chainLoading, error: chainError } = useChainFromQueryParams()

  if (!routerReady || chainLoading) {
    return null
  }

  if (!appUrl || !validChain || !chain) {
    router.push('/')
    return null
  }

  if (chainError) {
    throw new Error(chainError)
  }

  return (
    <main>
      <SafeAppLanding appUrl={appUrl} chain={chain} />
    </main>
  )
}

export default ShareSafeApp
