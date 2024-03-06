import { SafeAppLanding } from '@/components/safe-apps/SafeAppLandingPage'
import { useSafeAppUrl } from '@/hooks/safe-apps/useSafeAppUrl'
import { useCurrentChain } from '@/hooks/useChains'
import { Box, CircularProgress } from '@mui/material'
import Head from 'next/head'

const ShareSafeApp = () => {
  const appUrl = useSafeAppUrl()
  const chain = useCurrentChain()

  return (
    <>
      <Head>
        <title>{`Safe{Wallet} – Safe Apps`}</title>
      </Head>

      <main>
        {appUrl && chain ? (
          <SafeAppLanding appUrl={appUrl} chain={chain} />
        ) : (
          <Box data-sid="57642" py={4} textAlign="center">
            <CircularProgress size={40} />
          </Box>
        )}
      </main>
    </>
  )
}

export default ShareSafeApp
