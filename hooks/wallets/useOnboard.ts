import { useEffect } from 'react'
import { type OnboardAPI } from '@web3-onboard/core'
import { type ChainInfo } from '@gnosis.pm/safe-react-gateway-sdk'
import useChains, { useCurrentChain } from '@/hooks/useChains'
import { useAppSelector } from '@/store'
import { selectSession } from '@/store/sessionSlice'
import useAsync from '../useAsync'

// Initialize an onboard singleton when chains are loaded
// Return a cached singleton if already initialized
let onboardSingleton: OnboardAPI | null = null

export const initOnboardSingleton = async (chainConfigs: ChainInfo[]): Promise<OnboardAPI> => {
  if (!onboardSingleton) {
    const { createOnboard } = await import('@/services/onboard')
    onboardSingleton = createOnboard(chainConfigs)
  }
  return onboardSingleton
}

// Disable/enable wallets according to chain and cache the last used wallet
export const useInitOnboard = () => {
  const chain = useCurrentChain()
  const { lastWallet } = useAppSelector(selectSession)
  const { configs } = useChains()

  const [onboard] = useAsync(async () => {
    return initOnboardSingleton(configs)
  }, [configs])

  const [supportedWallets] = useAsync(async () => {
    if (!chain?.disabledWallets) return
    const { getSupportedWallets } = await import('@/hooks/wallets/wallets')
    return getSupportedWallets(chain.disabledWallets)
  }, [chain?.disabledWallets])

  // Disable unsupported wallets on the current chain
  useEffect(() => {
    if (onboard && supportedWallets) {
      onboard.state.actions.setWalletModules(supportedWallets)
    }
  }, [onboard, supportedWallets])

  // Connect to the last connected wallet
  useEffect(() => {
    if (onboard && lastWallet) {
      onboard.connectWallet({
        autoSelect: { label: lastWallet, disableModals: true },
      })
    }
  }, [onboard, lastWallet])
}

const useOnboard = (): OnboardAPI | null => {
  return onboardSingleton
}

export default useOnboard
