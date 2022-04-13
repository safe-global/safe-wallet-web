import { getChainsConfig, type ChainListResponse } from '@gnosis.pm/safe-react-gateway-sdk'
import { GATEWAY_URL } from 'config/constants'
import { useEffect } from 'react'
import { useAppDispatch } from 'store'
import { setChains } from 'store/chainsSlice'

let promise: Promise<ChainListResponse> | null = null
const getChains = (): Promise<ChainListResponse> => {
  promise = promise || getChainsConfig(GATEWAY_URL)
  promise.finally(() => (promise = null))
  return promise
}

const useChains = (): void => {
  const dispatch = useAppDispatch()

  useEffect(() => {
    getChains().then((data) => {
      dispatch(setChains(data.results))
    })
  }, [dispatch])
}

export default useChains
