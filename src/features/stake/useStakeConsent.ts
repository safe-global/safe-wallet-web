import { localItem } from '@/services/local-storage/local'
import { useCallback, useEffect, useState } from 'react'

const STAKE_CONSENT_STORAGE_KEY = 'stakeDisclaimerAcceptedV1'
const stakeConsentStorage = localItem<boolean>(STAKE_CONSENT_STORAGE_KEY)

const useStakeConsent = (): {
  isConsentAccepted: boolean | undefined
  onAccept: () => void
} => {
  const [isConsentAccepted, setIsConsentAccepted] = useState<boolean | undefined>()

  const onAccept = useCallback(() => {
    setIsConsentAccepted(true)
    stakeConsentStorage.set(true)
  }, [setIsConsentAccepted])

  useEffect(() => {
    setIsConsentAccepted(stakeConsentStorage.get() || false)
  }, [setIsConsentAccepted])

  return {
    isConsentAccepted,
    onAccept,
  }
}

export default useStakeConsent
