import { useEffect } from 'react'
import { getCollectiblesPage, type SafeCollectiblesPage } from '@gnosis.pm/safe-react-gateway-sdk'
import useAsync, { type AsyncResult } from './useAsync'
import { Errors, logError } from '@/services/exceptions'
import useSafeAddress from './useSafeAddress'
import useChainId from './useChainId'

export const useCollectibles = (pageUrl?: string): AsyncResult<SafeCollectiblesPage> => {
  const chainId = useChainId()
  const safeAddress = useSafeAddress()

  const [data, error, loading] = useAsync<SafeCollectiblesPage | undefined>(async () => {
    return getCollectiblesPage(chainId, safeAddress, undefined, pageUrl)
  }, [safeAddress, chainId, pageUrl])

  // Log errors
  useEffect(() => {
    if (error) {
      logError(Errors._604, error.message)
    }
  }, [error])

  return [data, error, loading]
}

export default useCollectibles
