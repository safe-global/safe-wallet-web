import React from 'react'
import { Spinner, View } from 'tamagui'

import { Alert } from '@/src/components/Alert'
import { Dropdown } from '@/src/components/Dropdown'
import { Fiat } from '@/src/components/Fiat'
import { SafeOverview } from '@safe-global/store/gateway/AUTO_GENERATED/safes'
import { Chain } from '@safe-global/store/gateway/AUTO_GENERATED/chains'

import { ChainItems } from './ChainItems'
import { ChainsDisplay } from '@/src/components/ChainsDisplay'

interface BalanceProps {
  activeChain: Chain
  data: SafeOverview[]
  isLoading: boolean
  chains: Chain[]
  onChainChange: (chainId: string) => void
}

export function Balance({ activeChain, data, chains, isLoading, onChainChange }: BalanceProps) {
  const balance = data?.find((chain) => chain.chainId === activeChain.chainId)

  return (
    <View>
      <View marginBottom="$8">
        {activeChain && (
          <Dropdown<SafeOverview>
            label={activeChain?.chainName}
            dropdownTitle="Select network:"
            leftNode={<ChainsDisplay activeChainId={activeChain.chainId} chains={chains} max={1} />}
            items={data}
            keyExtractor={({ item }) => item.chainId}
            renderItem={({ item, onClose }) => (
              <ChainItems
                onSelect={(chainId: string) => {
                  onChainChange(chainId)
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
