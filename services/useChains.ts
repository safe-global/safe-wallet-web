import { useEffect } from 'react'
import type { ChainInfo } from '@gnosis.pm/safe-react-gateway-sdk'

import { useAppDispatch, useAppSelector } from '@/store'
import { fetchChains, selectChainById, selectChains } from '@/store/chainsSlice'
import useSafeAddress from '@/services/useSafeAddress'

export const useInitChains = (): void => {
  const dispatch = useAppDispatch()

  useEffect(() => {
    const promise = dispatch(fetchChains())
    return promise.abort
  }, [dispatch])
}

const useChains = () => {
  return useAppSelector(selectChains)
}

export default useChains

export const useCurrentChain = (): ChainInfo | undefined => {
  const { chainId } = useSafeAddress()
  const chainConfig = useAppSelector((state) => selectChainById(state, chainId))
  return chainConfig
}
