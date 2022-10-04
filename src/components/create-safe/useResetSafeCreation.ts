import type { StepRenderProps } from '@/components/tx/TxStepper/useTxStepper'
import useIsWrongChain from '@/hooks/useIsWrongChain'
import useWallet from '@/hooks/wallets/useWallet'
import { useEffect } from 'react'

const useResetSafeCreation = (setStep: StepRenderProps['setStep']) => {
  const wallet = useWallet()
  const isWrongChain = useIsWrongChain()

  useEffect(() => {
    if (isWrongChain || !wallet) {
      setStep(0)
    }
  }, [setStep, isWrongChain, wallet])
}

export default useResetSafeCreation
