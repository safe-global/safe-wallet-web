import { AppRoutes } from '@/config/routes'
import { OVERVIEW_LABELS } from '@/services/analytics'
import router from 'next/router'

export const getTrackingLabel = (): string => {
  return router.pathname === AppRoutes.welcome.accounts ? OVERVIEW_LABELS.login_page : OVERVIEW_LABELS.sidebar
}
