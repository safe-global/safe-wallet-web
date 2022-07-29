import { useEffect, useState } from 'react'
import { type OnboardAPI } from '@web3-onboard/core'
import { type ChainInfo } from '@gnosis.pm/safe-react-gateway-sdk'
import useChains, { useCurrentChain } from '@/hooks/useChains'
import { useAppSelector } from '@/store'
import { selectSession } from '@/store/sessionSlice'
import { createOnboard } from '@/services/onboard'

// Initialize an onboard singleton when chains are loaded
// Return a cached singleton if already initialized
let onboardSingleton: OnboardAPI | null = null

export const initOnboardSingleton = (chainConfigs: ChainInfo[]): OnboardAPI => {
  if (!onboardSingleton) {
    onboardSingleton = createOnboard(chainConfigs)
  }
  return onboardSingleton
}

const useOnboard = (): OnboardAPI | null => {
  const { configs } = useChains()
  const [onboard, setOnboard] = useState<OnboardAPI | null>(null)

  useEffect(() => {
    if (configs.length > 0) {
      setOnboard(initOnboardSingleton(configs))
    }
  }, [configs])

  return onboard
}

// Disable/enable wallets according to chain and cache the last used wallet
export const useInitOnboard = () => {
  const chain = useCurrentChain()
  const { lastWallet } = useAppSelector(selectSession)
  const onboard = useOnboard()

  // Disable unsupported wallets on the current chain
  useEffect(() => {
    if (!onboard || !chain?.disabledWallets) return

    const enableWallets = async () => {
      const { getSupportedWallets } = await import('@/hooks/wallets/wallets')
      const supportedWallets = getSupportedWallets(chain.disabledWallets)
      onboard.state.actions.setWalletModules(supportedWallets)
    }

    enableWallets()
  }, [chain?.disabledWallets, onboard])

  // Connect to the last connected wallet
  useEffect(() => {
    if (onboard && lastWallet) {
      onboard.connectWallet({
        autoSelect: { label: lastWallet, disableModals: true },
      })
    }
  }, [onboard, lastWallet])
}

export default useOnboard
