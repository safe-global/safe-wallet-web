import { groupPendingTxs } from '@/src/features/TxHistory/utils'
import { selectActiveChain } from '@/src/store/activeChainSlice'
import { useGetPendingTxsQuery } from '@/src/store/gateway'
import { TransactionListItem } from '@safe-global/safe-gateway-typescript-sdk'
import { useEffect, useMemo, useState } from 'react'
import { useSelector } from 'react-redux'

const usePendingTxs = () => {
  const activeChain = useSelector(selectActiveChain)
  const [list, setList] = useState<TransactionListItem[]>([])
  const [pageUrl, setPageUrl] = useState<string>()

  const { data, isLoading, isFetching, refetch, isUninitialized } = useGetPendingTxsQuery(
    {
      chainId: activeChain?.chainId,
      safeAddress: '0xA77DE01e157f9f57C7c4A326eeE9C4874D0598b6',
      pageUrl,
    },
    {
      skip: !activeChain?.chainId,
    },
  )

  useEffect(() => {
    if (!data?.results) return

    setList((prev) => [...prev, ...data.results])
  }, [data])

  const fetchMoreTx = async () => {
    if (!data?.next) return

    setPageUrl(data.next)

    refetch()
  }

  const pendingTxs = useMemo(() => groupPendingTxs(list || []), [list])

  return {
    hasMore: data?.next,
    amount: pendingTxs.amount,
    data: pendingTxs.sections,
    fetchMoreTx,
    isLoading: isLoading || isUninitialized,
    isFetching: isFetching,
  }
}

export default usePendingTxs
