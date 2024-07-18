import { useCallback } from 'react'
import useLocalStorage from '@/services/local-storage/useLocalStorage'

const STAKE_CONSENT_STORAGE_KEY = 'stakeDisclaimerAcceptedV1'

const useStakeConsent = (): {
  isConsentAccepted: boolean
  onAccept: () => void
} => {
  const [isConsentAccepted = false, setIsConsentAccepted] = useLocalStorage<boolean>(STAKE_CONSENT_STORAGE_KEY)

  const onAccept = useCallback(() => {
    setIsConsentAccepted(true)
  }, [setIsConsentAccepted])

  return {
    isConsentAccepted,
    onAccept,
  }
}

export default useStakeConsent
