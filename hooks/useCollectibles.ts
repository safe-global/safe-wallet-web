import { useAppSelector } from '@/store'
import { selectCollectibles } from '@/store/collectiblesSlice'

const useCollectibles = () => {
  const state = useAppSelector(selectCollectibles)
  return {
    collectibles: state.data,
    loading: state.loading,
    error: state.error,
  }
}

export default useCollectibles
