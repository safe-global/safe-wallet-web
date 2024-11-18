import React from 'react'
import PendingTxList from './PendingTxList'
import usePendingTxs from '@/src/hooks/usePendingTxs'

function PendingTx() {
  const { data, isLoading, fetchMoreTx, hasMore, amount } = usePendingTxs()
  return (
    <PendingTxList
      transactions={data}
      onEndReached={fetchMoreTx}
      isLoading={isLoading}
      amount={amount}
      hasMore={!!hasMore}
    />
  )
}

export default PendingTx
