import { AppRoutes } from '@/config/routes'
import { usePathname } from 'next/navigation'

const NO_HEADER_ROUTES = [AppRoutes.unsubscribe]

/**
 * Returns a boolean tuple indicating if the current route should display the header
 * @param pathname Optional server-side pathname to check against
 * @returns A boolean indicating if the sidebar should be displayed
 */
export function useIsHeaderRoute(pathname?: string): boolean {
  const clientPathname = usePathname()
  const route = pathname || clientPathname
  return !NO_HEADER_ROUTES.includes(route)
}
