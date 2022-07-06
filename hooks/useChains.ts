import { useEffect } from 'react'
import { ChainInfo, getChainsConfig } from '@gnosis.pm/safe-react-gateway-sdk'
import { useAppDispatch, useAppSelector } from '@/store'
import { selectChainById, selectChains, chainsSlice } from '@/store/chainsSlice'
import { useChainId } from './useChainId'
import useAsync from './useAsync'
import { logError, Errors } from '@/services/exceptions'

const getConfigs = async (): Promise<ChainInfo[]> => {
  const data = await getChainsConfig()
  return data.results || []
}

export const useInitChains = (): void => {
  const dispatch = useAppDispatch()

  const [data, error, loading] = useAsync<ChainInfo[]>(getConfigs, [])

  useEffect(() => {
    dispatch(
      chainsSlice.actions.set({
        data,
        error: error?.message,
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
  const state = useAppSelector(selectChains)
  return {
    configs: state.data,
    error: state.error,
    loading: state.loading,
  }
}

export default useChains

export const useCurrentChain = (): ChainInfo | undefined => {
  const chainId = useChainId()
  return useAppSelector((state) => selectChainById(state, chainId))
}
