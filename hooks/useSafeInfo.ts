import { useMemo } from 'react'
import { type SafeInfo } from '@gnosis.pm/safe-react-gateway-sdk'
import { useAppSelector } from '@/store'
import { defaultSafeInfo, selectSafeInfo } from '@/store/safeInfoSlice'

const useSafeInfo = (): {
  safe: SafeInfo
  safeAddress: string
  safeLoaded: boolean
  safeLoading: boolean
  safeError?: string
} => {
  const { data, error, loading } = useAppSelector(selectSafeInfo)

  return useMemo(
    () => ({
      safe: data || defaultSafeInfo,
      safeAddress: data?.address.value || '',
      safeLoaded: !!data,
      safeError: error,
      safeLoading: loading,
    }),
    [data, error, loading],
  )
}

export default useSafeInfo
