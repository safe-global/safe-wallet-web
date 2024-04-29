import type { NextPage } from 'next'
import Head from 'next/head'
import { useRouter } from 'next/router'
import SwapWidget from '@/features/swap'
import useSwapLegalDisclaimer from '@/features/swap/useSwapLegalDisclaimer'
import LegalDisclaimerContent from '@/components/common/LegalDisclaimerContent'
import Disclaimer from '@/components/common/Disclaimer'

const Swap: NextPage = () => {
  const router = useRouter()
  const { token, amount } = router.query
  const { isConsentAccepted, onAccept } = useSwapLegalDisclaimer()

  let sell = undefined
  if (token && amount) {
    sell = {
      asset: String(token),
      amount: String(amount),
    }
  }
  return (
    <>
      <Head>
        <title>{'Safe{Wallet} – Swap'}</title>
      </Head>

      <main className="swapWrapper">
        {isConsentAccepted ? (
          <SwapWidget sell={sell} />
        ) : (
          <Disclaimer
            title="Legal Disclaimer"
            content={<LegalDisclaimerContent withTitle={false} />}
            onAccept={onAccept}
          />
        )}
      </main>
    </>
  )
}

export default Swap
