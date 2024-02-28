import { useRouter } from 'next/router'
import useSafeInfo from '@/hooks/useSafeInfo'
import { useAppDispatch } from '@/store'
import { useCallback, useEffect } from 'react'
import { setVisitedSafe, type VisitedSafe } from '@/store/visitedSafesSlice'

export const useVisitedSafes = () => {
  const router = useRouter()
  const { safe } = useSafeInfo()
  const dispatch = useAppDispatch()

  const handleRouteChange = useCallback(() => {
    const { query } = router
    if (query.safe && safe.address.value) {
      const visitedSafe: VisitedSafe = {
        address: safe.address.value,
        chainId: safe.chainId,
        isWatchlist: false,
        threshold: safe.threshold,
        owners: safe.owners.length,
        lastAccessed: Date.now(),
      }
      dispatch(setVisitedSafe(visitedSafe))
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [safe, dispatch, router.query.safe])

  // This is a bit of a hack
  // Even though we listen to the route changes the state hasn't yet updated, and we store the old safe address
  // By having handleRouteChange as a dependency we make sure that the newest safe is going to be stored
  // as the last visited safe
  useEffect(() => {
    if (router.query.safe) {
      handleRouteChange()
    }
  }, [router.query.safe, handleRouteChange])

  // Listen to route changes
  useEffect(() => {
    router.events.on('routeChangeComplete', handleRouteChange)

    // Cleanup subscription on unmount
    return () => {
      router.events.off('routeChangeComplete', handleRouteChange)
    }
  }, [router, handleRouteChange])
}
