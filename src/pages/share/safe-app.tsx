import { Box, CircularProgress } from '@mui/material'
import { useRouter } from 'next/router'
import { useSafeAppUrl } from '@/hooks/safe-apps/useSafeAppUrl'
import { useChainFromQueryParams } from '@/hooks/safe-apps/useChainFromQueryParams'
import { SafeAppLanding } from '@/components/safe-apps/SafeAppLandingPage'
import { AppRoutes } from '@/config/routes'

const ShareSafeApp = () => {
  const router = useRouter()
  const [appUrl, routerReady] = useSafeAppUrl()
  const { chain, validChain, loading: chainLoading, error: chainError } = useChainFromQueryParams()

  if (!routerReady || chainLoading) {
    return (
      <Box py={4} textAlign="center">
        <CircularProgress size={40} />
      </Box>
    )
  }

  if (!appUrl || !validChain || !chain) {
    router.push(AppRoutes.index)
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
