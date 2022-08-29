import { useRouter } from 'next/router'
import useChains from '@/hooks/useChains'
import { useMemo } from 'react'

type ReturnType = {
  chainId?: string
  validChainId: boolean
  loading: boolean
  error: string | undefined
}

const useChainIdQueryParam = (): ReturnType => {
  const router = useRouter()
  const { chainId } = router.query
  // WARNING: the `loading` state is not accurate, the initial value for it is always `false`
  // Therefore, it's possible to confuse the state where the chains haven't been asked yet
  // with the final state. I did a dirty fix by checking if config/chains is empty and
  // assuming that the state is loading
  const { configs, error, loading } = useChains()

  const validChainId = useMemo(
    () => configs.some(({ chainId: configChainId }) => configChainId === chainId),
    [chainId, configs],
  )

  return {
    chainId: typeof chainId === 'string' ? chainId : undefined,
    validChainId,
    loading: !router.isReady || configs.length == 0 || Boolean(loading),
    error,
  }
}

export { useChainIdQueryParam }
