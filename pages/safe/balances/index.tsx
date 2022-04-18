import type { NextPage } from 'next'

import AssetsTable from '@/components/balances/AssetsTable'
import CurrencySelect from '@/components/balances/CurrencySelect'
import useBalances from '@/services/useBalances'

const Balances: NextPage = () => {
  const balances = useBalances()

  return (
    <main>
      <h2>Balances</h2>

      <CurrencySelect />

      <AssetsTable items={balances?.items} />
    </main>
  )
}

export default Balances
