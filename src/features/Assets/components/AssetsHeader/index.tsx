import { PendingTransactions } from '@/src/components/StatusBanners/PendingTransactions'
import usePendingTxs from '@/src/hooks/usePendingTxs'
import { router } from 'expo-router'
import { View } from 'tamagui'
import Balance from '../Balance'
import { StyledAssetsHeader } from './styles'
import { useCallback } from 'react'

const AssetsHeader = () => {
  const { amount, hasMore, isLoading } = usePendingTxs()

  const onPendingTransactionsPress = useCallback(() => {
    router.push('/pending-transactions')
  }, [router])

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

      <Balance />
    </StyledAssetsHeader>
  )
}

export default AssetsHeader
