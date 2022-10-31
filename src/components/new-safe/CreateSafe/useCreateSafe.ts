import type { StepRenderProps } from '@/components/tx/TxStepper/useTxStepper'
import useIsWrongChain from '@/hooks/useIsWrongChain'
import useWallet from '@/hooks/wallets/useWallet'
import { useEffect } from 'react'
import useLocalStorage from '@/services/local-storage/useLocalStorage'
import { SAFE_PENDING_CREATION_STORAGE_KEY } from '@/components/create-safe/status/CreationStatus'
import type { PendingSafeData } from '@/components/create-safe/types.d'

const useCreateSafe = (setStep: StepRenderProps['setStep']) => {
  const [pendingSafe] = useLocalStorage<PendingSafeData | undefined>(SAFE_PENDING_CREATION_STORAGE_KEY, undefined)
  const wallet = useWallet()
  const isWrongChain = useIsWrongChain()

  useEffect(() => {
    // Jump to the status screen if there is already a tx submitted
    if (pendingSafe) {
      setStep(4)
    }
  }, [setStep, pendingSafe])

  const isConnected = wallet && !isWrongChain

  return { isConnected }
}

export default useCreateSafe
