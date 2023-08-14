import { useEffect } from 'react'
import type { StepRenderProps } from '@/components/new-safe/CardStepper/useCardStepper'
import type { NewSafeFormData } from '@/components/new-safe/create/index'
import useWallet from '@/hooks/wallets/useWallet'
import { usePendingSafe } from './steps/StatusStep/usePendingSafe'
import useIsWrongChain from '@/hooks/useIsWrongChain'

const useSyncSafeCreationStep = (setStep: StepRenderProps<NewSafeFormData>['setStep']) => {
  const [pendingSafe] = usePendingSafe()
  const wallet = useWallet()
  const isWrongChain = useIsWrongChain()

  useEffect(() => {
    // Jump to the status screen if there is already a tx submitted
    if (pendingSafe) {
      setStep(4)
      return
    }

    // Jump to connect wallet step if there is no wallet and no pending Safe
    if (!wallet) {
      setStep(0)
      return
    }

    // Jump to choose name and network step if the wallet is connected to the wrong chain and there is no pending Safe
    if (isWrongChain) {
      setStep(1)
      return
    }
  }, [wallet, setStep, pendingSafe, isWrongChain])
}

export default useSyncSafeCreationStep
