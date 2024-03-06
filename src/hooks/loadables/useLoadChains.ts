import { Errors, logError } from '@/services/exceptions'
import { getChainsConfig, type ChainInfo } from '@safe-global/safe-gateway-typescript-sdk'
import { useEffect } from 'react'
import useAsync, { type AsyncResult } from '../useAsync'

const getConfigs = async (): Promise<ChainInfo[]> => {
  const data = await getChainsConfig()
  return data.results || []
}

export const useLoadChains = (): AsyncResult<ChainInfo[]> => {
  const [data, error, loading] = useAsync<ChainInfo[]>(getConfigs, [])

  // Log errors
  useEffect(() => {
    if (error) {
      logError(Errors._620, error.message)
    }
  }, [error])

  return [data, error, loading]
}

export default useLoadChains
