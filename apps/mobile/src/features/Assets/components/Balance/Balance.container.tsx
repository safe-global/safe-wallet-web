import { selectActiveChain, switchActiveChain } from '@/src/store/activeChainSlice'
import { useDispatch, useSelector } from 'react-redux'
import { useSafesGetSafeOverviewV1Query } from '@safe-global/store/gateway/AUTO_GENERATED/safes'
import { selectActiveSafe } from '@/src/store/activeSafeSlice'
import { SafeOverviewResult } from '@safe-global/store/gateway/types'
import { POLLING_INTERVAL } from '@/src/config/constants'
import { getChainsByIds, selectAllChains } from '@/src/store/chains'
import { Balance } from './Balance'
import { makeSafeId } from '@/src/utils/formatters'
import { RootState } from '@/src/store'
import { selectActiveSafeInfo } from '@/src/store/safesSlice'

export function BalanceContainer() {
  const activeChain = useSelector(selectActiveChain)
  const chains = useSelector(selectAllChains)
  const activeSafe = useSelector(selectActiveSafe)
  const dispatch = useDispatch()
  const activeSafeInfo = useSelector((state: RootState) => selectActiveSafeInfo(state, activeSafe.address))
  const activeSafeChains = useSelector((state: RootState) => getChainsByIds(state, activeSafeInfo.chains))

  const { data, isLoading } = useSafesGetSafeOverviewV1Query<SafeOverviewResult>(
    {
      safes: chains.map((chain) => makeSafeId(chain.chainId, activeSafe.address)).join(','),
      currency: 'usd',
      trusted: true,
      excludeSpam: true,
    },
    {
      pollingInterval: POLLING_INTERVAL,
      skip: chains.length === 0,
    },
  )

  const handleChainChange = (id: string) => {
    dispatch(switchActiveChain({ id }))
  }

  return (
    <Balance
      data={data}
      chains={activeSafeChains}
      isLoading={isLoading}
      activeChain={activeChain}
      onChainChange={handleChainChange}
    />
  )
}
