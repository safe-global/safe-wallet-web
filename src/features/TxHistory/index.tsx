import React, { useEffect, useState } from 'react'
import TxHistoryList from './TxHistoryList'
import { useSelector } from 'react-redux'
import { selectActiveChain } from '@/src/store/activeChainSlice'
import { useGetTxsHistoryQuery } from '../../store/gateway'
import type { TransactionItemPage } from '../../store/gateway/AUTO_GENERATED/transactions'

function TxHistory() {
  const [pageUrl, setPageUrl] = useState<string>()
  const [list, setList] = useState<TransactionItemPage['results']>([])
  const activeChain = useSelector(selectActiveChain)
  const { data, refetch, isFetching, isUninitialized } = useGetTxsHistoryQuery({
    chainId: activeChain.chainId,
    safeAddress: '0xA77DE01e157f9f57C7c4A326eeE9C4874D0598b6',
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
