import { useMemo } from 'react'
import { type SafeCollectibleResponse } from '@gnosis.pm/safe-react-gateway-sdk'
import { useAppSelector } from '@/store'
import { selectCollectibles } from '@/store/collectiblesSlice'

const useCollectibles = (): {
  collectibles: SafeCollectibleResponse[]
  loading: boolean
  error?: string
} => {
  const state = useAppSelector(selectCollectibles)

  return useMemo(
    () => ({
      collectibles: state.data,
      loading: state.loading,
      error: state.error,
    }),
    [state.data, state.loading, state.error],
  )
}

export default useCollectibles
