import { useAppSelector } from '@/store'
import { selectCollectibles } from '@/store/collectiblesSlice'

const useCollectibles = () => {
  return useAppSelector(selectCollectibles)
}

export default useCollectibles
