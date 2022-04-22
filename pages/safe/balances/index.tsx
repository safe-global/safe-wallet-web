import type { NextPage } from 'next'

import AssetsTable from '@/components/balances/AssetsTable'
import CurrencySelect from '@/components/balances/CurrencySelect'
import useBalances from '@/services/useBalances'
import useOnboard from '@/services/useOnboard'

const Balances: NextPage = () => {
  const balances = useBalances()
  const onboard = useOnboard()

  return (
    <main>
      <h2>Balances</h2>
      <button onClick={() => onboard?.connectWallet()}>Connect Wallet</button>
      <CurrencySelect />

      <AssetsTable items={balances?.items} />
    </main>
  )
}

export default Balances
