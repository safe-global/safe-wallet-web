import { ChainInfo, getChainsConfig, type ChainListResponse } from '@gnosis.pm/safe-react-gateway-sdk'
import { useEffect } from 'react'
import { useAppDispatch, useAppSelector } from '@/store'
import { selectChainById, selectChains, setChains } from '@/store/chainsSlice'
import { Errors, logError } from './exceptions'
import useAsync from './useAsync'
import useSafeAddress from './useSafeAddress'

export const useInitChains = (): { error?: Error; loading: boolean } => {
  const dispatch = useAppDispatch()

  const [data, error, loading] = useAsync<ChainListResponse>(getChainsConfig, [])

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

const useChains = () => {
  const chains = useAppSelector(selectChains)
  return chains
}

export default useChains

export const useCurrentChain = (): ChainInfo | undefined => {
  const { chainId } = useSafeAddress()
  const chainConfig = useAppSelector((state) => selectChainById(state, chainId))
  return chainConfig
}
