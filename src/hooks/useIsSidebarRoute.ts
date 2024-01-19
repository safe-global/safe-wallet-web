import { AppRoutes } from '@/config/routes'
import { usePathname } from 'next/navigation'
import { useRouter } from 'next/router'

const NO_SIDEBAR_ROUTES = [
  AppRoutes.share.safeApp,
  AppRoutes.newSafe.create,
  AppRoutes.newSafe.load,
  AppRoutes.index,
  AppRoutes.welcome.index,
  AppRoutes.welcome.socialLogin,
  AppRoutes.imprint,
  AppRoutes.privacy,
  AppRoutes.cookie,
  AppRoutes.terms,
  AppRoutes.licenses,
]

const TOGGLE_SIDEBAR_ROUTES = [AppRoutes.apps.open]

export function useIsSidebarRoute(): [boolean, boolean] {
  const pathname = usePathname()
  const noSidebar = NO_SIDEBAR_ROUTES.includes(pathname)
  const router = useRouter()
  const hasSafe = !router.isReady || !!router.query.safe
  return [!noSidebar && hasSafe, TOGGLE_SIDEBAR_ROUTES.includes(pathname)]
}
