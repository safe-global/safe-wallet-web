import { useAppSelector } from '@/store'
import { defaultSafeInfo, selectSafeInfo, type ExtendedSafeInfo } from '@/store/safeInfoSlice'
import isEqual from 'lodash/isEqual'
import { useMemo } from 'react'

const useSafeInfo = (): {
  safe: ExtendedSafeInfo
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
