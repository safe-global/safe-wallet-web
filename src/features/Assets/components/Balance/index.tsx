import Dropdown from '@/src/components/Dropdown'
import { selectActiveChain, switchActiveChain } from '@/src/store/activeChainSlice'
import React from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Image, Spinner, View } from 'tamagui'
import { SafeOverview, useSafesGetSafeOverviewV1Query } from '@/src/store/gateway/AUTO_GENERATED/safes'
import { selectActiveSafe } from '@/src/store/activeSafeSlice'
import { SafeOverviewResult } from '@/src/store/gateway/types'
import Fiat from '@/src/components/Fiat'
import { Alert } from '@/src/components/Alert'
import { POLLING_INTERVAL } from '@/src/config/constants'
import { selectAllChains } from '@/src/store/gateway/chains'
import ChainItems from './ChainItems'

const makeSafeId = (chainId: string, address: string) => `${chainId}:${address}` as `${number}:0x${string}`

function Balance() {
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

  const balance = data?.find((chain) => chain.chainId === activeChain.chainId)

  const handleChainChange = (id: string) => {
    dispatch(switchActiveChain({ id }))
  }

  return (
    <View>
      <View marginBottom="$8">
        {activeChain && (
          <Dropdown<SafeOverview>
            label={activeChain?.chainName}
            dropdownTitle="Select network:"
            leftNode={
              activeChain?.chainLogoUri && (
                <Image marginRight="$2" width="24" height="24" source={{ uri: activeChain?.chainLogoUri }} />
              )
            }
            items={data}
            keyExtractor={({ item }) => item.chainId}
            renderItem={({ item, onClose }) => (
              <ChainItems
                onSelect={(chainId: string) => {
                  handleChainChange(chainId)
                  onClose()
                }}
                activeChain={activeChain}
                fiatTotal={item.fiatTotal}
                chains={chains}
                chainId={item.chainId}
                key={item.chainId}
              />
            )}
          />
        )}

        {isLoading ? (
          <Spinner />
        ) : balance ? (
          <Fiat baseAmount={balance.fiatTotal} />
        ) : (
          <Alert type="error" message="error while getting the balance of your wallet" />
        )}
      </View>
    </View>
  )
}

export default Balance
