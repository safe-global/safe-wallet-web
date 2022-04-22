import { useCallback, useEffect, useState } from 'react'
import Web3 from 'web3'
import init, { WalletState } from '@web3-onboard/core'
import { Subscription } from 'rxjs'

import { getRecommendedInjectedWallets, getSupportedWalletModules } from '@/config/wallets'
import useSafeAddress from '@/services/useSafeAddress'
import useChains from '@/services/useChains'
import useSafeInfo from '@/services/useSafeInfo'
import { setSafeSDK, setWeb3 } from '@/services/web3'
import {
  getOnboardInstance,
  getPrimaryAccount,
  setOnboardInstance,
  _getOnboardState,
  _onboardInstance,
} from '@/services/onboard'
import { formatRpcServiceUrl } from '@/config/chains'
import { INFURA_TOKEN } from '@/config/constants'
import connect from '@web3-onboard/core/dist/connect'

const useInitOnboard = (): void => {
  const { configs, loading } = useChains()
  const { address, chainId } = useSafeAddress()
  const { safe } = useSafeInfo()

  useEffect(() => {
    if (loading || configs.length === _getOnboardState()?.chains.length) {
      return
    }

    let subscription: Subscription | null = null

    ;(async () => {
      const onboard = init({
        wallets: await getSupportedWalletModules(configs, chainId),
        chains: configs.map(({ chainId, chainName, nativeCurrency, rpcUri, theme }) => ({
          id: Web3.utils.numberToHex(chainId),
          label: chainName,
          rpcUrl: formatRpcServiceUrl(rpcUri, INFURA_TOKEN),
          token: nativeCurrency.symbol,
          color: theme.backgroundColor,
        })),
        appMetadata: {
          name: 'Gnosis Safe',
          icon: `<svg viewBox="0 0 280 280" xmlns="http://www.w3.org/2000/svg">
                   <path d="M137,9.84A128.75,128.75,0,1,0,265.7,138.59,128.76,128.76,0,0,0,137,9.84Zm94.23,135.78H171.44a36.38,36.38,0,1,1,.28-12.66h59.46a6.33,6.33,0,0,1,0,12.66Z" stroke="#fff" />
                 </svg>`,
          description: 'Please select a wallet to connect to Gnosis Safe',
          recommendedInjectedWallets: getRecommendedInjectedWallets(),
        },
      })

      subscription = onboard.state.select('wallets').subscribe((wallets) => {
        setWeb3(wallets)
        setSafeSDK(getPrimaryAccount(wallets).address, chainId, address, safe.version)
      })

      setOnboardInstance(onboard)
    })()

    return () => {
      subscription?.unsubscribe?.()
    }
  }, [configs, loading, chainId, address])
}

export default useInitOnboard
