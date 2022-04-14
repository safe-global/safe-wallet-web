import { getChainsConfig, type ChainListResponse } from '@gnosis.pm/safe-react-gateway-sdk'
import { GATEWAY_URL } from 'config/constants'
import { useEffect } from 'react'
import { useAppDispatch } from 'store'
import { setChains } from 'store/chainsSlice'
import { Errors, logError } from './exceptions/CodedException'
import useAsync from './useAsync'

let promise: Promise<ChainListResponse> | null = null
const getChains = (): Promise<ChainListResponse> => {
  promise = promise || getChainsConfig(GATEWAY_URL)
  promise.finally(() => (promise = null))
  return promise
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
