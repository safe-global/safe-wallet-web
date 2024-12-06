import { selectActiveChain, switchActiveChain } from '@/src/store/activeChainSlice'
import { useDispatch, useSelector } from 'react-redux'
import { useSafesGetSafeOverviewV1Query } from '@/src/store/gateway/AUTO_GENERATED/safes'
import { selectActiveSafe } from '@/src/store/activeSafeSlice'
import { SafeOverviewResult } from '@/src/store/gateway/types'
import { POLLING_INTERVAL } from '@/src/config/constants'
import { selectAllChains } from '@/src/store/gateway/chains'
import { Balance } from './Balance'

const makeSafeId = (chainId: string, address: string) => `${chainId}:${address}` as `${number}:0x${string}`

export function BalanceContainer() {
  const activeChain = useSelector(selectActiveChain)
  const chains = useSelector(selectAllChains)
  const activeSafe = useSelector(selectActiveSafe)
  const dispatch = useDispatch()
  const { data, isLoading } = useSafesGetSafeOverviewV1Query<SafeOverviewResult>(
    {
      safes: chains.map((chain) => makeSafeId(chain.chainId, activeSafe.address)).join(','),
      currency: 'usd',
      trusted: true,
      excludeSpam: true,
    },
    {
      pollingInterval: POLLING_INTERVAL,
    },
  )

  const handleChainChange = (id: string) => {
    dispatch(switchActiveChain({ id }))
  }

  return (
    <Balance
      data={data}
      chains={chains}
      isLoading={isLoading}
      activeChain={activeChain}
      onChainChange={handleChainChange}
    />
  )
}
