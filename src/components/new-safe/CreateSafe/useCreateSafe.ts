import useIsWrongChain from '@/hooks/useIsWrongChain'
import useWallet from '@/hooks/wallets/useWallet'
import { useEffect } from 'react'
import useLocalStorage from '@/services/local-storage/useLocalStorage'
import type { StepRenderProps } from '@/components/new-safe/CardStepper/useCardStepper'
import type { PendingSafeData } from '@/components/new-safe/steps/Step4'
import type { NewSafeFormData } from '@/components/new-safe/CreateSafe/index'
import { SAFE_PENDING_CREATION_STORAGE_KEY } from '@/components/new-safe/steps/Step4'

const useCreateSafe = (setStep: StepRenderProps<NewSafeFormData>['setStep']) => {
  const [pendingSafe] = useLocalStorage<PendingSafeData | undefined>(SAFE_PENDING_CREATION_STORAGE_KEY)
  const wallet = useWallet()
  const isWrongChain = useIsWrongChain()

  const isConnected = wallet && !isWrongChain

  useEffect(() => {
    if (isWrongChain || !wallet) {
      setStep(0)
    }

    // Jump to the status screen if there is already a tx submitted
    if (pendingSafe) {
      setStep(4)
    }
  }, [setStep, isWrongChain, wallet, pendingSafe])

  return { isConnected }
}

export default useCreateSafe
