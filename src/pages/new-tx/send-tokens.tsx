import type { NextPage } from 'next'
import Head from 'next/head'
import { useRouter } from 'next/router'
import TokenTransferFlow from '@/components/new-tx/TokenTransfer/TokenTransferFlow'

const SendTokens: NextPage = () => {
  const { query } = useRouter()

  // TODO: Parse query param correctly
  const txNonce = query.nonce ? Number(query.nonce) : undefined

  return (
    <>
      <Head>
        <title>{'Safe{Wallet} – Send Tokens'}</title>
      </Head>

      <TokenTransferFlow txNonce={txNonce} />
    </>
  )
}

export default SendTokens
