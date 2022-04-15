import { getChainsConfig, type ChainListResponse } from '@gnosis.pm/safe-react-gateway-sdk'
import { GATEWAY_URL } from 'config/constants'
import { useEffect } from 'react'
import { useAppDispatch } from 'store'
import { setChains } from 'store/chainsSlice'
import { Errors, logError } from './exceptions/CodedException'
import useAsync from './useAsync'

const getChains = (): Promise<ChainListResponse> => {
  return getChainsConfig(GATEWAY_URL)
}

const useChains = (): { error?: Error; loading: boolean } => {
  const dispatch = useAppDispatch()

  const [data, error, loading] = useAsync<ChainListResponse>(getChains, [])

  useEffect(() => {
    if (data) {
      dispatch(setChains(data.results))
    }
  }, [data, dispatch])

  useEffect(() => {
    if (error) {
      logError(Errors._904, error.message)
    }
  }, [error])

  return { error, loading }
}

export default useChains
