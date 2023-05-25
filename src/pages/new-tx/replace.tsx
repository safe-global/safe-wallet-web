import type { NextPage } from 'next'
import Head from 'next/head'
import { useRouter } from 'next/router'
import ReplaceTx from '@/components/new-tx/ReplaceTx'

const Replace: NextPage = () => {
  const { query } = useRouter()

  // TODO: Parse query param correctly
  const txNonce = query.nonce ? Number(query.nonce) : undefined

  return (
    <>
      <Head>
        <title>{'Safe{Wallet} – New transaction'}</title>
      </Head>

      <ReplaceTx txNonce={txNonce} />
    </>
  )
}

export default Replace
