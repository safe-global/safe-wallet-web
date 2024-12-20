import usePendingTxs from '@/src/hooks/usePendingTxs'
import { router } from 'expo-router'
import { useCallback } from 'react'
import { AssetsHeader } from './AssetsHeader'

export const AssetsHeaderContainer = () => {
  const { amount, hasMore, isLoading } = usePendingTxs()

  const onPendingTransactionsPress = useCallback(() => {
    router.push('/pending-transactions')
  }, [router])

  return (
    <AssetsHeader
      isLoading={isLoading}
      hasMore={hasMore}
      amount={amount}
      onPendingTransactionsPress={onPendingTransactionsPress}
    />
  )
}
