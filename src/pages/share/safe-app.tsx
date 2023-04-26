import { Box, CircularProgress } from '@mui/material'
import { useRouter } from 'next/router'
import { useSafeAppUrl } from '@/hooks/safe-apps/useSafeAppUrl'
import { useChainFromQueryParams } from '@/hooks/safe-apps/useChainFromQueryParams'
import { SafeAppLanding } from '@/components/safe-apps/SafeAppLandingPage'
import { AppRoutes } from '@/config/routes'
import Head from 'next/head'

const ShareSafeApp = () => {
  const router = useRouter()
  const appUrl = useSafeAppUrl()
  const { chain, validChain, loading: chainLoading, error: chainError } = useChainFromQueryParams()

  if (chainLoading) {
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
    <>
      <Head>
        <title>Safe Apps – Share</title>
      </Head>

      <main>
        <SafeAppLanding appUrl={appUrl} chain={chain} />
      </main>
    </>
  )
}

export default ShareSafeApp
