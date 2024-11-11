import React, { useEffect, useState } from 'react'
import TxHistoryList from './TxHistoryList'
import { TransactionListItem } from '@safe-global/safe-gateway-typescript-sdk'
import { useSelector } from 'react-redux'
import { selectActiveChain } from '@/src/store/activeChainSlice'
import { useGetTxHistoryQuery } from '../../store/gateway'

function TxHistory() {
  const [pageUrl, setPageUrl] = useState<string>()
  const [list, setList] = useState<TransactionListItem[]>([])
  const activeChain = useSelector(selectActiveChain)
  const { data, refetch, isFetching, isUninitialized } = useGetTxHistoryQuery({
    chainId: activeChain.chainId,
    safeAddress: '0xA77DE01e157f9f57C7c4A326eeE9C4874D0598b6',
    pageUrl,
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
