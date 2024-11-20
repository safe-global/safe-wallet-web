import React, { useEffect, useState } from 'react'
import TxHistoryList from './TxHistoryList'
import { useSelector } from 'react-redux'
import { selectActiveSafe } from '@/src/store/activeSafeSlice'
import { useGetTxsHistoryQuery } from '../../store/gateway'
import type { TransactionItemPage } from '../../store/gateway/AUTO_GENERATED/transactions'

function TxHistory() {
  const [pageUrl, setPageUrl] = useState<string>()
  const [list, setList] = useState<TransactionItemPage['results']>([])
  const activeSafe = useSelector(selectActiveSafe)
  const { data, refetch, isFetching, isUninitialized } = useGetTxsHistoryQuery({
    chainId: activeSafe.chainId,
    safeAddress: activeSafe.address,
    cursor: pageUrl,
  })

  useEffect(() => {
    if (!data?.results) return

    setList((prev) => [...prev, ...data.results])
  }, [data])

  const onEndReached = () => {
    if (!data?.next) return

    setPageUrl(data.next)
    refetch()
  }

  return <TxHistoryList transactions={list} onEndReached={onEndReached} isLoading={isFetching || isUninitialized} />
}

export default TxHistory
