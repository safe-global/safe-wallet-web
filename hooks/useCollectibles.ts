import { useEffect } from 'react'
import { getCollectiblesPage, type SafeCollectiblesPage } from '@gnosis.pm/safe-react-gateway-sdk'
import useAsync, { type AsyncResult } from './useAsync'
import useSafeInfo from './useSafeInfo'
import { Errors, logError } from '@/services/exceptions'

export const useCollectibles = (pageUrl?: string): AsyncResult<SafeCollectiblesPage> => {
  const { safe, safeAddress, safeLoaded } = useSafeInfo()
  const { chainId } = safe

  const [data, error, loading] = useAsync<SafeCollectiblesPage | undefined>(async () => {
    if (!safeLoaded) return
    return getCollectiblesPage(chainId, safeAddress, undefined, pageUrl)
  }, [safeLoaded, safeAddress, chainId, pageUrl])

  // Log errors
  useEffect(() => {
    if (error) {
      logError(Errors._604, error.message)
    }
  }, [error])

  return [data, error, loading]
}

export default useCollectibles
