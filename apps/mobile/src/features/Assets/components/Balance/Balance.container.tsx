import { useDispatch, useSelector } from 'react-redux'
import { useSafesGetSafeOverviewV1Query } from '@safe-global/store/gateway/AUTO_GENERATED/safes'
import { selectActiveSafe, switchActiveChain } from '@/src/store/activeSafeSlice'
import { SafeOverviewResult } from '@safe-global/store/gateway/types'
import { POLLING_INTERVAL } from '@/src/config/constants'
import { getChainsByIds, selectAllChains } from '@/src/store/chains'
import { Balance } from './Balance'
import { makeSafeId } from '@/src/utils/formatters'
import { RootState } from '@/src/store'
import { selectSafeInfo } from '@/src/store/safesSlice'

export function BalanceContainer() {
  const chains = useSelector(selectAllChains)
  const activeSafe = useSelector(selectActiveSafe)
  const dispatch = useDispatch()
  const activeSafeInfo = useSelector((state: RootState) => selectSafeInfo(state, activeSafe.address))
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

  const handleChainChange = (chainId: string) => {
    dispatch(switchActiveChain({ chainId }))
  }

  return (
    <Balance
      data={data}
      chains={activeSafeChains}
      isLoading={isLoading}
      activeChainId={activeSafe.chainId}
      onChainChange={handleChainChange}
    />
  )
}
