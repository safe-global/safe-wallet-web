import { useEffect } from 'react'
import { type OnboardAPI } from '@web3-onboard/core'
import { type ChainInfo } from '@gnosis.pm/safe-react-gateway-sdk'
import useChains, { useCurrentChain } from '@/hooks/useChains'
import { useAppSelector } from '@/store'
import { selectSession } from '@/store/sessionSlice'
import ExternalStore from '@/services/ExternalStore'

const { setStore, useStore } = new ExternalStore<OnboardAPI>()

export const initOnboard = async (chainConfigs: ChainInfo[]): Promise<OnboardAPI> => {
  const { createOnboard } = await import('@/services/onboard')
  return createOnboard(chainConfigs)
}

// Disable/enable wallets according to chain and cache the last used wallet
export const useInitOnboard = () => {
  const { configs } = useChains()
  const chain = useCurrentChain()
  const { lastWallet } = useAppSelector(selectSession)
  const onboard = useStore()

  useEffect(() => {
    if (configs.length > 0) {
      initOnboard(configs).then(setStore)
    }
  }, [configs])

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

export default useStore
