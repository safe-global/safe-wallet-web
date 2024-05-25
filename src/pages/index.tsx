import type { NextPage } from 'next'
import Head from 'next/head'

import SecurityLogin from '@/components/settings/SecurityLogin'
import SocialSigner from '@/components/common/SocialSigner'
import { Alert, Box } from '@mui/material'

const SecurityLoginPage: NextPage = () => {
  return (
    <>
      <Head>
        <title>{'Safe{Wallet} – Settings – Security & Login'}</title>
      </Head>

      <main>
        <Box width="80%" margin="0 auto 50px">
          <Alert severity="warning" sx={{ mt: 1, width: '100%' }}>
            We&apos;ve discontinued support for Google login. Please export your private key and import it into your
            wallet.
          </Alert>
        </Box>

        <Box width={300} margin="30px auto">
          <SocialSigner />
        </Box>
        <SecurityLogin />
      </main>
    </>
  )
}

export default SecurityLoginPage
