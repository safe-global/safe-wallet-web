import { getChainsConfig, type ChainListResponse } from '@gnosis.pm/safe-react-gateway-sdk'
import { GATEWAY_URL } from 'config/constants'
import { useEffect } from 'react'
import { useAppDispatch } from 'store'
import { setChains } from 'store/chainsSlice'
import { Errors, logError } from './exceptions/CodedException'

let promise: Promise<ChainListResponse> | null = null
const getChains = (): Promise<ChainListResponse> => {
  promise = promise || getChainsConfig(GATEWAY_URL)
  promise.finally(() => (promise = null))
  return promise
}

const useChains = (): void => {
  const dispatch = useAppDispatch()

  useEffect(() => {
    getChains()
      .then((data) => {
        dispatch(setChains(data.results))
      })
      .catch((err) => {
        logError(Errors._904, err.message)
      })
  }, [dispatch])
}

export default useChains
