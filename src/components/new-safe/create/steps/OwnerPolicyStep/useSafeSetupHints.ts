import { useEffect } from 'react'
import type { CreateSafeInfoItem } from '@/components/new-safe/create/CreateSafeInfos'

export const useSafeSetupHints = (
  setHint: (hint: CreateSafeInfoItem | undefined) => void,
  threshold?: number,
  noOwners?: number,
  multiChain?: boolean,
) => {
  useEffect(() => {
    const safeSetupWarningSteps: { title: string; text: string }[] = []

    // 1/n warning
    if (threshold === 1) {
      safeSetupWarningSteps.push({
        title: `1/${noOwners} policy`,
        text: 'Use a threshold higher than one to prevent losing access to your Safe Account in case a signer key is lost or compromised.',
      })
    }

    // n/n warning
    if (threshold === noOwners && noOwners && noOwners > 1) {
      safeSetupWarningSteps.push({
        title: `${noOwners}/${noOwners} policy`,
        text: 'Use a threshold which is lower than the total number of signers of your Safe Account in case a signer loses access to their account and needs to be replaced.',
      })
    }

    // n/n warning
    if (multiChain) {
      safeSetupWarningSteps.push({
        title: `Same address. Many networks.`,
        text: 'You can choose which networks to deploy your account on and will need to deploy them one by one after creation.',
      })
    }

    setHint({ title: 'Safe Account setup', variant: 'info', steps: safeSetupWarningSteps })

    // Clear dynamic hints when the step / hook unmounts
    return () => {
      setHint(undefined)
    }
  }, [threshold, noOwners, setHint, multiChain])
}
