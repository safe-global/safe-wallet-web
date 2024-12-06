import React from 'react'
import { PendingTxListContainer } from '@/src/features/PendingTx/components/PendingTxList'
import usePendingTxs from '@/src/hooks/usePendingTxs'

export function PendingTxContainer() {
  const { data, isLoading, fetchMoreTx, hasMore, amount } = usePendingTxs()

  return (
    <PendingTxListContainer
      transactions={data}
      onEndReached={fetchMoreTx}
      isLoading={isLoading}
      amount={amount}
      hasMore={!!hasMore}
    />
  )
}
