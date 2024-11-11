import React from 'react'
import PendingTxList from './PendingTxList'
import usePendingTxs from '@/src/hooks/usePendingTxs'

function PendingTx() {
  const { data, isLoading, fetchMoreTx } = usePendingTxs()

  return <PendingTxList transactions={data} onEndReached={fetchMoreTx} isLoading={isLoading} />
}

export default PendingTx
