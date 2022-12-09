import { useMemo } from 'react'
import isEqual from 'lodash/isEqual'
import { type SafeInfo } from '@safe-global/safe-gateway-typescript-sdk'
import { useAppSelector } from '@/store'
import { defaultSafeInfo, selectSafeInfo } from '@/store/safeInfoSlice'

const useSafeInfo = (): {
  safe: SafeInfo
  safeAddress: string
  safeLoaded: boolean
  safeLoading: boolean
  safeError?: string
} => {
  const { data, error, loading } = useAppSelector(selectSafeInfo, isEqual)

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
