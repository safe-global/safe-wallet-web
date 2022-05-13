import { useAppSelector } from '@/store'
import { selectCurrentChainId, selectCurrentSession } from '@/store/currentSessionSlice'

const useCurrentSession = () => {
  return useAppSelector(selectCurrentSession)
}

export const useCurrentChainId = () => {
  return useAppSelector(selectCurrentChainId)
}

export default useCurrentSession
