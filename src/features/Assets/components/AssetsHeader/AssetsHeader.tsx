import React from 'react'
import { StyledAssetsHeader } from './styles'
import { View } from 'tamagui'
import { BalanceContainer } from '../Balance'
import { PendingTransactions } from '@/src/components/StatusBanners/PendingTransactions'

interface AssetsHeaderProps {
  amount: number
  isLoading: boolean
  onPendingTransactionsPress: () => void
  hasMore: boolean
}

export function AssetsHeader({ amount, isLoading, onPendingTransactionsPress, hasMore }: AssetsHeaderProps) {
  return (
    <StyledAssetsHeader backgroundColor="$background">
      <View marginBottom="$10" marginTop="$2">
        {amount > 0 && (
          <PendingTransactions
            isLoading={isLoading}
            onPress={onPendingTransactionsPress}
            number={`${amount}${hasMore ? '+' : ''}`}
          />
        )}
      </View>

      <BalanceContainer />
    </StyledAssetsHeader>
  )
}
