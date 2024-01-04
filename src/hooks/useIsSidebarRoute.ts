import { AppRoutes } from '@/config/routes'
import { usePathname } from 'next/navigation'

const NO_SIDEBAR_ROUTES = [
  AppRoutes.share.safeApp,
  AppRoutes.newSafe.create,
  AppRoutes.newSafe.load,
  AppRoutes.index,
  AppRoutes.imprint,
  AppRoutes.privacy,
  AppRoutes.cookie,
  AppRoutes.terms,
  AppRoutes.licenses,
]

export function useIsSidebarRoute(): boolean {
  const pathname = usePathname()
  return !NO_SIDEBAR_ROUTES.includes(pathname)
}
