import type { NextPage } from 'next'

import { useAppSelector } from 'store'
import { selectBalances } from 'store/balancesSlice'
import AssetsTable from 'components/balances/AssetsTable'

const Balances: NextPage = () => {
  const balances = useAppSelector(selectBalances)

  return (
    <main>
      <h2>Balances</h2>
      <AssetsTable items={balances?.items} />
    </main>
  )
}

export default Balances
