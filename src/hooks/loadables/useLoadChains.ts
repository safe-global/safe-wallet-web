import { useEffect } from 'react'
import { type ChainInfo } from '@gnosis.pm/safe-react-gateway-sdk'
import useAsync, { type AsyncResult } from '../useAsync'
import { logError, Errors } from '@/services/exceptions'
import { CONFIG_SERVICE_CHAINS } from '@/tests/mocks/chains'

const getConfigs = async (): Promise<ChainInfo[]> => {
  // const data = await getChainsConfig()
  // return data.results || []
  return CONFIG_SERVICE_CHAINS
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
