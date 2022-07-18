import { IS_PRODUCTION } from '@/config/constants'

export const IFRAME_HOST = IS_PRODUCTION
  ? 'https://gnosis-safe.io'
  : 'https://pr4017--safereact.review-safe.gnosisdev.com' // 'https://safe-team.dev.gnosisdev.com'
export const IFRAME_PATH = '/app/migrate.html'
export const MIGRATION_KEY = 'migrationFinished'
