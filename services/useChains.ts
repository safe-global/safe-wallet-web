import { ChainInfo, getChainsConfig, type ChainListResponse } from '@gnosis.pm/safe-react-gateway-sdk'
import { useEffect } from 'react'
import { useAppDispatch, useAppSelector } from '@/store'
import { selectChainById, selectChains, setChains } from '@/store/chainsSlice'
import { Errors, logError } from './exceptions'
import useAsync from './useAsync'
import { useChainId } from './useChainId'

export const useInitChains = (): void => {
  const dispatch = useAppDispatch()

  const [data, error, loading] = useAsync<ChainListResponse>(getChainsConfig, [])

  // Update data
  useEffect(() => {
    dispatch(
      setChains({
        configs: data?.results || [],
        error,
        loading,
      }),
    )
  }, [dispatch, data, error, loading])

  // Log errors
  useEffect(() => {
    if (error) {
      logError(Errors._904, error.message)
    }
  }, [error])
}

const useChains = () => {
  return useAppSelector(selectChains)
}

export default useChains

export const useCurrentChain = (): ChainInfo | undefined => {
  const chainId = useChainId()
  return useAppSelector((state) => selectChainById(state, chainId))
}
