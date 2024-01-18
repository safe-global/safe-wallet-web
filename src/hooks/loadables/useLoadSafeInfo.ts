import { useAppSelector } from '@/store'
import { selectUndeployedSafe } from '@/store/undeployedSafeSlice'
import { useEffect } from 'react'
import { getSafeInfo, ImplementationVersionState, type SafeInfo } from '@safe-global/safe-gateway-typescript-sdk'
import useAsync, { type AsyncResult } from '../useAsync'
import useSafeAddress from '../useSafeAddress'
import { useChainId } from '../useChainId'
import useIntervalCounter from '../useIntervalCounter'
import useSafeInfo from '../useSafeInfo'
import { Errors, logError } from '@/services/exceptions'
import { LATEST_SAFE_VERSION, POLLING_INTERVAL } from '@/config/constants'

export type ExtendedSafeInfo = SafeInfo & { deployed: boolean }

export const useLoadSafeInfo = (): AsyncResult<ExtendedSafeInfo> => {
  const address = useSafeAddress()
  const chainId = useChainId()
  const [pollCount, resetPolling] = useIntervalCounter(POLLING_INTERVAL)
  const { safe } = useSafeInfo()
  const isStoredSafeValid = safe.chainId === chainId && safe.address.value === address
  const undeployedSafe = useAppSelector((state) => selectUndeployedSafe(state, chainId, address))

  const [data, error, loading] = useAsync<ExtendedSafeInfo | undefined>(async () => {
    if (!chainId || !address) return

    if (undeployedSafe) {
      return Promise.resolve({
        address: { value: address },
        chainId,
        owners: undeployedSafe.safeAccountConfig.owners.map((owner) => ({ value: owner })),
        nonce: 0,
        threshold: undeployedSafe.safeAccountConfig.threshold,
        implementation: { value: '' },
        implementationVersionState: ImplementationVersionState.UP_TO_DATE,
        modules: null,
        guard: null,
        fallbackHandler: { value: undeployedSafe.safeAccountConfig.fallbackHandler! },
        version: LATEST_SAFE_VERSION,
        collectiblesTag: '',
        txQueuedTag: '',
        txHistoryTag: '',
        messagesTag: '',
        deployed: false,
      })
    }

    const safeInfo = await getSafeInfo(chainId, address)

    return { ...safeInfo, deployed: true }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chainId, address, pollCount, undeployedSafe])

  // Reset the counter when safe address/chainId changes
  useEffect(() => {
    resetPolling()
  }, [resetPolling, address, chainId])

  // Log errors
  useEffect(() => {
    if (error) {
      logError(Errors._600, error.message)
    }
  }, [error])

  return [
    // Return stored SafeInfo between polls
    data ?? (isStoredSafeValid ? safe : data),
    error,
    loading,
  ]
}

export default useLoadSafeInfo
