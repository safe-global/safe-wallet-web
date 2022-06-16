import { useEffect } from 'react'
import { getSafeInfo, SafeInfo } from '@gnosis.pm/safe-react-gateway-sdk'
import { useAppDispatch, useAppSelector } from '@/store'
import { selectSafeInfo, setSafeInfo } from '@/store/safeInfoSlice'
import useSafeAddress from './useSafeAddress'
import { POLLING_INTERVAL } from '@/config/constants'
import useIntervalCounter from './useIntervalCounter'
import useAsync from './useAsync'
import { useChainId } from './useChainId'
import { addOrUpdateSafe, selectAddedSafes } from '@/store/addedSafesSlice'

// Poll & dispatch the Safe Info into the store
export const useInitSafeInfo = (): void => {
  const address = useSafeAddress()
  const chainId = useChainId()
  const addedSafes = useAppSelector((state) => selectAddedSafes(state, chainId))
  const [counter, resetCounter] = useIntervalCounter(POLLING_INTERVAL)
  const dispatch = useAppDispatch()

  const [data, error, loading] = useAsync<SafeInfo | undefined>(async () => {
    if (!chainId || !address) return
    return await getSafeInfo(chainId, address)
  }, [chainId, address, counter])

  // Reset the counter when safe address/chainId changes
  useEffect(() => {
    resetCounter()
  }, [dispatch, resetCounter, address, chainId])

  // Update the store when the Safe Info is fetched
  useEffect(() => {
    // Take errors and loading state into account only for initial requests when counter is 0
    if (data || counter === 0) {
      dispatch(setSafeInfo({ safe: data, error, loading }))
    }
    // TODO: Add flag to check that it's added first
    // Update cached Safe info
    const isSafeAdded = !!addedSafes?.[address]
    if (data) {
      // && isSafeAdded) {
      dispatch(addOrUpdateSafe({ chainId, safe: data }))
    }
  }, [dispatch, counter, data, error, loading])
}

const useSafeInfo = () => {
  return useAppSelector(selectSafeInfo)
}

export default useSafeInfo
