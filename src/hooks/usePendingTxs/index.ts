import { useGetPendingTxsQuery } from '@/src/store/gateway'
import { useEffect, useMemo, useState } from 'react'
import { useSelector } from 'react-redux'
import { QueuedItemPage } from '@/src/store/gateway/AUTO_GENERATED/transactions'
import { groupPendingTxs } from '@/src/features/PendingTx/utils'
import { selectActiveSafe } from '@/src/store/activeSafeSlice'

const usePendingTxs = () => {
  const activeSafe = useSelector(selectActiveSafe)
  const [list, setList] = useState<QueuedItemPage['results']>([])
  const [pageUrl, setPageUrl] = useState<string>()

  const { data, isLoading, isFetching, refetch, isUninitialized } = useGetPendingTxsQuery(
    {
      chainId: activeSafe.chainId,
      safeAddress: activeSafe.address,
      cursor: pageUrl,
    },
    {
      skip: !activeSafe.chainId,
    },
  )

  useEffect(() => {
    if (!data?.results) {
      return
    }

    setList((prev) => [...prev, ...data.results])
  }, [data])

  const fetchMoreTx = async () => {
    if (!data?.next) {
      return
    }

    setPageUrl(data.next)

    refetch()
  }

  const pendingTxs = useMemo(() => groupPendingTxs(list || []), [list])

  return {
    hasMore: Boolean(data?.next),
    amount: pendingTxs.amount,
    data: pendingTxs.sections,
    fetchMoreTx,
    isLoading: isLoading || isUninitialized,
    isFetching: isFetching,
  }
}

export default usePendingTxs
