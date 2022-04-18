import type { NextPage } from 'next'

import { useAppSelector } from 'store'
import { selectBalances } from '@/store/balancesSlice'
import AssetsTable from '@/components/balances/AssetsTable'
import CurrencySelect from '@/components/balances/CurrencySelect'

const Balances: NextPage = () => {
  const balances = useAppSelector(selectBalances)

  return (
    <main>
      <h2>Balances</h2>

      <CurrencySelect />

      <AssetsTable items={balances?.items} />
    </main>
  )
}

export default Balances
