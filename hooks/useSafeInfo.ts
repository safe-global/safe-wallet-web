import { useAppSelector } from '@/store'
import { selectSafeInfo } from '@/store/safeInfoSlice'

const useSafeInfo = () => {
  const { data, error, loading } = useAppSelector(selectSafeInfo)
  return {
    safe: data,
    safeAddress: data?.address.value,
    error,
    loading,
  }
}

export default useSafeInfo
