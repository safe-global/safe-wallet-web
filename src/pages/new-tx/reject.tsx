import type { NextPage } from 'next'
import Head from 'next/head'
import { useRouter } from 'next/router'
import RejectTx from '@/components/new-tx/RejectTx'

const Reject: NextPage = () => {
  const router = useRouter()
  const { nonce = '' } = router.query

  // TODO: Parse query param correctly
  const txNonce = Array.isArray(nonce) ? Number(nonce[0]) : Number(nonce)

  return (
    <>
      <Head>
        <title>{'Safe{Wallet} – New transaction'}</title>
      </Head>

      <RejectTx txNonce={txNonce} />
    </>
  )
}

export default Reject
