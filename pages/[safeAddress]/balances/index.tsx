import type { NextPage } from 'next'

import { selectSafeInfo } from 'store/safeInfoSlice'
import useSafeAddress from 'services/useSafeAddress'
import { useAppSelector } from 'store'
import { selectChainById } from 'store/chainsSlice'
import { selectBalances } from 'store/balancesSlice'
import AssetsTable from 'components/balances/AssetsTable'

const Balances: NextPage = () => {
  const { chainId } = useSafeAddress()
  const { safe } = useAppSelector(selectSafeInfo)
  const chainConfig = useAppSelector((state) => selectChainById(state, chainId))
  const balances = useAppSelector(selectBalances)

  return (
    <main>
      <h1>Hello Safe on {chainConfig?.chainName}</h1>
      Owners: {safe.owners.map((item) => item.value).join(', ')}
      <h2>Balances</h2>
      <AssetsTable items={balances?.items} />
    </main>
  )
}

export default Balances
