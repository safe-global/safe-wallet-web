import type { NextPage } from 'next'
import Head from 'next/head'
import { useRouter } from 'next/router'
import useLastSafe from '@/hooks/useLastSafe'
import useSafeWalletConnect from '@/safe-wallet-provider/useSafeWalletConnect'

const Connect: NextPage = () => {
  const router = useRouter()
  const { safe } = router.query
  const lastSafe = useLastSafe()

  if (!safe && lastSafe) {
    router.replace(`/connect?safe=${lastSafe}`)
  }

  useSafeWalletConnect()

  return (
    <>
      <Head>
        <title>{'Safe{Wallet} – Connect'}</title>
      </Head>

      <main>
        <h1>Connect</h1>
      </main>
    </>
  )
}

export default Connect
