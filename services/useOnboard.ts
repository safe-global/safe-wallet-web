import { useEffect, useState } from 'react'
import Web3 from 'web3'
import { init } from '@web3-onboard/react'
import { web3Onboard } from '@web3-onboard/react'

import { formatRpcServiceUrl } from 'utils/chains'
import { setWeb3 } from 'utils/web3'
import { getRecommendedInjectedWallets, getSupportedWalletModules } from 'config/wallets'
import { useAppSelector } from 'store'
import { selectChains } from 'store/chainsSlice'
import useSafeAddress from 'services/useSafeAddress'

const useOnboard = (): void => {
  const [unsubscribe, setUnsubscribe] = useState<() => void>()
  const chains = useAppSelector(selectChains)
  const { chainId } = useSafeAddress()

  useEffect(() => {
    if (web3Onboard || chains.length === 0) {
      return
    }

    const initOnboard = async () => {
      const onboard = init({
        wallets: await getSupportedWalletModules(chains, chainId),
        chains: chains.map(({ chainId, chainName, nativeCurrency, rpcUri, theme }) => ({
          id: Web3.utils.numberToHex(chainId),
          label: chainName,
          rpcUrl: formatRpcServiceUrl(rpcUri),
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

      const subscription = onboard.state.select('wallets').subscribe(setWeb3)

      setUnsubscribe(subscription.unsubscribe)
    }

    initOnboard()

    return () => {
      unsubscribe?.()
    }
  }, [web3Onboard, chains, chainId])
}

export default useOnboard
