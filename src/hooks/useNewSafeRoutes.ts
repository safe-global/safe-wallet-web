import useABTest from '@/hooks/useABTest'
import { AppRoutes } from '@/config/routes'

export const NEW_SAFE_AB_TEST_NAME = 'newSafe'

const useNewSafeRoutes = () => {
  const shouldUseNewRoute = useABTest(NEW_SAFE_AB_TEST_NAME)

  return {
    createSafe: shouldUseNewRoute ? AppRoutes.newSafe.create : AppRoutes.open,
    addSafe: shouldUseNewRoute ? AppRoutes.newSafe.add : AppRoutes.load,
  }
}

export default useNewSafeRoutes
