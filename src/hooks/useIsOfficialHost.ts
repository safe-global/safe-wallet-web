import { useMemo } from 'react'
import { IS_OFFICIAL_HOST, OFFICIAL_HOSTS } from '@/config/constants'

export const useIsOfficialHost = (): boolean => {
  return useMemo(
    () => IS_OFFICIAL_HOST && (typeof window === 'undefined' || OFFICIAL_HOSTS.test(window.location.host)),
    [],
  )
}
