import { useEffect } from 'react'
import { type Slice } from '@reduxjs/toolkit'
import { useAppDispatch } from '@/store'
import { type AsyncResult } from './useAsync'
import useSafeInfo from './useSafeInfo'

// import all the loadable hooks
import useLoadChains from './loadables/useLoadChains'
import useLoadSafeInfo from './loadables/useLoadSafeInfo'
import useLoadBalances from './loadables/useLoadBalances'
import useLoadCollectibles from './loadables/useLoadCollectibles'
import useLoadTxHistory from './loadables/useLoadTxHistory'
import useLoadTxQueue from './loadables/useLoadTxQueue'

// import all the loadable slices
import { chainsSlice } from '../store/chainsSlice'
import { safeInfoSlice } from '../store/safeInfoSlice'
import { balancesSlice } from '../store/balancesSlice'
import { collectiblesSlice } from '../store/collectiblesSlice'
import { txHistorySlice } from '../store/txHistorySlice'
import { txQueueSlice } from '../store/txQueueSlice'

// Dispatch into the corresponding store when the loadable is loaded
const useUpdateStore = (slice: Slice, useLoadHook: () => AsyncResult<unknown>): void => {
  const dispatch = useAppDispatch()
  const [data, error, loading] = useLoadHook()

  useEffect(() => {
    dispatch(slice.actions.set({ data, error: error?.message, loading }))
  }, [data, error, loading])
}

const useLoadableStores = () => {
  useUpdateStore(chainsSlice, useLoadChains)
  useUpdateStore(safeInfoSlice, useLoadSafeInfo)
  useUpdateStore(balancesSlice, useLoadBalances)
  useUpdateStore(collectiblesSlice, useLoadCollectibles)
  useUpdateStore(txHistorySlice, useLoadTxHistory)
  useUpdateStore(txQueueSlice, useLoadTxQueue)
}

export default useLoadableStores
