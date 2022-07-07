import { useAppSelector } from '@/store'
import { selectSafeInfo } from '@/store/safeInfoSlice'

const useSafeInfo = () => {
  const { data, error, loading } = useAppSelector(selectSafeInfo)
  return {
    safe: data,
    error: data ? undefined : error,
    loading: loading && !data,
  }
}

export default useSafeInfo
