import type { NextPage } from 'next'
import { useConnectWallet } from '@web3-onboard/react'

import AssetsTable from '@/components/balances/AssetsTable'
import CurrencySelect from '@/components/balances/CurrencySelect'
import useBalances from '@/services/useBalances'

const Balances: NextPage = () => {
  const balances = useBalances()
  const [, connectWallet] = useConnectWallet()

  return (
    <main>
      <h2>Balances</h2>
      <button onClick={() => connectWallet({})}>Connect Wallet</button>
      <CurrencySelect />

      <AssetsTable items={balances?.items} />
    </main>
  )
}

export default Balances
