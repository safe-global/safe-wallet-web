import useUndeployedSafe from '@/components/new-safe/create/steps/StatusStep/useUndeployedSafe'
import { useEffect } from 'react'
import type { StepRenderProps } from '@/components/new-safe/CardStepper/useCardStepper'
import type { NewSafeFormData } from '@/components/new-safe/create/index'
import useWallet from '@/hooks/wallets/useWallet'
import useIsWrongChain from '@/hooks/useIsWrongChain'
import { useRouter } from 'next/router'
import { AppRoutes } from '@/config/routes'

const useSyncSafeCreationStep = (setStep: StepRenderProps<NewSafeFormData>['setStep']) => {
  const [safeAddress, pendingSafe] = useUndeployedSafe()

  const wallet = useWallet()
  const isWrongChain = useIsWrongChain()
  const router = useRouter()

  useEffect(() => {
    // Jump to the status screen if there is already a tx submitted
    if (pendingSafe && pendingSafe.status.status !== 'AWAITING_EXECUTION') {
      setStep(3)
      return
    }

    // Jump to the welcome page if there is no wallet
    if (!wallet) {
      router.push({ pathname: AppRoutes.welcome.index, query: router.query })
    }

    // Jump to choose name and network step if the wallet is connected to the wrong chain and there is no pending Safe
    if (isWrongChain) {
      setStep(0)
      return
    }
  }, [wallet, setStep, pendingSafe, isWrongChain, router])
}

export default useSyncSafeCreationStep
