import { useEffect } from 'react'
import useLocalStorage from '@/services/local-storage/useLocalStorage'
import type { StepRenderProps } from '@/components/new-safe/CardStepper/useCardStepper'
import type { PendingSafeData } from '@/components/new-safe/steps/Step4'
import type { NewSafeFormData } from '@/components/new-safe/CreateSafe/index'
import { SAFE_PENDING_CREATION_STORAGE_KEY } from '@/components/new-safe/steps/Step4'
import useWallet from '@/hooks/wallets/useWallet'

const useSyncSafeCreationStep = (setStep: StepRenderProps<NewSafeFormData>['setStep']) => {
  const [pendingSafe] = useLocalStorage<PendingSafeData | undefined>(SAFE_PENDING_CREATION_STORAGE_KEY)
  const wallet = useWallet()

  useEffect(() => {
    if (!wallet) {
      setStep(0)
    }

    // Jump to the status screen if there is already a tx submitted
    if (pendingSafe) {
      setStep(4)
    }
  }, [wallet, setStep, pendingSafe])
}

export default useSyncSafeCreationStep
