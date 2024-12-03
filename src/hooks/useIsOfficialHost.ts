import { useMemo } from 'react'
import { OFFICIAL_HOSTS } from '@/config/constants'

export const useIsOfficialHost = (): boolean => {
  return useMemo(() => (typeof window === 'undefined' ? true : OFFICIAL_HOSTS.test(window.location.host)), [])
}
