import { useEffect } from 'react'
import type { StepRenderProps } from '@/components/tx/TxStepper/useTxStepper'
import useIsWrongChain from '@/hooks/useIsWrongChain'
import useWallet from '@/hooks/wallets/useWallet'
import usePendingCreation from './usePendingCreation'

const useSetCreationStep = (setStep: StepRenderProps['setStep']) => {
  const [pendingSafe] = usePendingCreation()
  const wallet = useWallet()
  const isWrongChain = useIsWrongChain()

  useEffect(() => {
    if (isWrongChain || !wallet) {
      setStep(0)
    }

    // Jump to the status screen if there is already a tx submitted
    if (pendingSafe) {
      setStep(4)
    }
  }, [setStep, isWrongChain, wallet, pendingSafe])
}

export default useSetCreationStep
