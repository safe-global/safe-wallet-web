import type { NextPage } from 'next'

import WalletInfo from '@/components/common/WalletInfo'
import OverviewWidget from '@/components/create-safe/OverviewWidget'
import { useCurrentChain } from '@/hooks/useChains'
import useWallet from '@/hooks/wallets/useWallet'

const Demo: NextPage = () => {
  const wallet = useWallet()
  const chain = useCurrentChain()

  const rows = [
    ...(wallet && chain ? [{ title: 'Wallet', component: <WalletInfo wallet={wallet} chain={chain} /> }] : []),
  ]

  return (
    <main>
      <OverviewWidget rows={rows} />
    </main>
  )
}

export default Demo
