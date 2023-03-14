// TODO: refactor using useCurrentChain()

import { useMemo } from 'react'
import { useRouter } from 'next/router'
import type { ChainInfo } from '@safe-global/safe-gateway-typescript-sdk'
import useChains from '@/hooks/useChains'

type ReturnType = {
  chain?: ChainInfo
  validChain: boolean
  loading: boolean
  error: string | undefined
}

const useChainFromQueryParams = (): ReturnType => {
  const router = useRouter()
  const { chain } = router.query
  // WARNING: the `loading` state is not accurate, the initial value for it is always `false`
  // Therefore, it's possible to confuse the state where the chains haven't been asked yet
  // with the final state. I did a dirty fix by checking if config/chains is empty and
  // assuming that the state is loading
  const { configs, error, loading } = useChains()

  const chainInfo = useMemo(
    () => configs.find(({ shortName: configChainShortName }) => configChainShortName === chain),
    [chain, configs],
  )

  return {
    chain: chainInfo,
    validChain: !!chainInfo,
    loading: !router.isReady || configs.length == 0 || Boolean(loading),
    error,
  }
}

export { useChainFromQueryParams }
