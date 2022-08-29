import { useRouter } from 'next/router'
import { useSafeAppUrl } from '@/hooks/safe-apps/useSafeAppUrl'
import { useChainIdQueryParam } from '@/hooks/safe-apps/useChainIdQueryParam'
import { SafeAppLanding } from '@/components/safe-apps/SafeAppLandingPage'

const ShareSafeApp = () => {
  const router = useRouter()
  const [appUrl, routerReady] = useSafeAppUrl()
  const { chainId, validChainId, loading: chainIdLoading, error: chainIdError } = useChainIdQueryParam()

  if (!routerReady || chainIdLoading) {
    return null
  }

  if (!appUrl || !validChainId || !chainId) {
    router.push('/')
    return null
  }

  if (chainIdError) {
    throw new Error(chainIdError)
  }

  return (
    <main>
      <SafeAppLanding appUrl={appUrl} chainId={chainId} />
    </main>
  )
}

export default ShareSafeApp
