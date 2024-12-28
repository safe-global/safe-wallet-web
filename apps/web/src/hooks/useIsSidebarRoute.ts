import { AppRoutes } from '@/config/routes'
import { usePathname } from 'next/navigation'
import { useRouter } from 'next/router'

const NO_SIDEBAR_ROUTES = [
  AppRoutes.share.safeApp,
  AppRoutes.newSafe.create,
  AppRoutes.newSafe.load,
  AppRoutes.index,
  AppRoutes.welcome.index,
  AppRoutes.welcome.accounts,
  AppRoutes.welcome.bundles,
  AppRoutes.bundle,
  AppRoutes.imprint,
  AppRoutes.privacy,
  AppRoutes.cookie,
  AppRoutes.terms,
  AppRoutes.licenses,
]

const TOGGLE_SIDEBAR_ROUTES = [AppRoutes.apps.open]

/**
 * Returns a boolean tuple indicating if the current route should display the sidebar and if the sidebar can be toggled
 * @param pathname Optional server-side pathname to check against
 * @returns A tuple with the first value indicating if the sidebar should be displayed and the second value indicating if the sidebar can be toggled
 */
export function useIsSidebarRoute(pathname?: string): [boolean, boolean] {
  const clientPathname = usePathname()
  const route = pathname || clientPathname || ''
  const noSidebar = NO_SIDEBAR_ROUTES.includes(route)
  const toggledSidebar = TOGGLE_SIDEBAR_ROUTES.includes(route)
  const router = useRouter()
  const hasSafe = !router.isReady || !!router.query.safe
  return [!noSidebar && hasSafe, toggledSidebar]
}
