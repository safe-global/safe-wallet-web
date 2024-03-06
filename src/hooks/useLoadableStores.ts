import { useAppDispatch } from '@/store'
import { type Slice } from '@reduxjs/toolkit'
import { useEffect } from 'react'
import { type AsyncResult } from './useAsync'

// Import all the loadable hooks
import useLoadBalances from './loadables/useLoadBalances'
import useLoadChains from './loadables/useLoadChains'
import useLoadSafeInfo from './loadables/useLoadSafeInfo'
import useLoadMessages from './loadables/useLoadSafeMessages'
import useLoadTxHistory from './loadables/useLoadTxHistory'
import useLoadTxQueue from './loadables/useLoadTxQueue'

// Import all the loadable slices
import useLoadSpendingLimits from '@/hooks/loadables/useLoadSpendingLimits'
import { balancesSlice } from '@/store/balancesSlice'
import { chainsSlice } from '@/store/chainsSlice'
import { safeInfoSlice } from '@/store/safeInfoSlice'
import { safeMessagesSlice } from '@/store/safeMessagesSlice'
import { spendingLimitSlice } from '@/store/spendingLimitsSlice'
import { txHistorySlice } from '@/store/txHistorySlice'
import { txQueueSlice } from '@/store/txQueueSlice'

// Dispatch into the corresponding store when the loadable is loaded
const useUpdateStore = (slice: Slice, useLoadHook: () => AsyncResult<unknown>): void => {
  const dispatch = useAppDispatch()
  const [data, error, loading] = useLoadHook()
  const setAction = slice.actions.set

  useEffect(() => {
    dispatch(
      setAction({
        data,
        error: data ? undefined : error?.message,
        loading: loading && !data,
      }),
    )
  }, [dispatch, setAction, data, error, loading])
}

const useLoadableStores = () => {
  useUpdateStore(chainsSlice, useLoadChains)
  useUpdateStore(safeInfoSlice, useLoadSafeInfo)
  useUpdateStore(balancesSlice, useLoadBalances)
  useUpdateStore(txHistorySlice, useLoadTxHistory)
  useUpdateStore(txQueueSlice, useLoadTxQueue)
  useUpdateStore(safeMessagesSlice, useLoadMessages)
  useUpdateStore(spendingLimitSlice, useLoadSpendingLimits)
}

export default useLoadableStores
