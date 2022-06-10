import { createContext, useContext, useEffect, useState, type ReactElement } from 'react'
import type { JsonRpcProvider, Web3Provider as Web3ProviderType } from '@ethersproject/providers'

import useWallet from '@/services/wallets/useWallet'
import { useCurrentChain } from '@/services/useChains'
import { createWeb3Provider, createWeb3ReadOnlyProvider } from '@/services/wallets/web3'

type Web3ContextType = {
  web3?: Web3ProviderType
  web3ReadOnly?: JsonRpcProvider
}

const initialWeb3Context: Web3ContextType = {
  web3: undefined,
  web3ReadOnly: undefined,
}

const Web3Context = createContext<Web3ContextType>({
  web3: undefined,
  web3ReadOnly: undefined,
})

const Web3Provider = ({ children }: { children: ReactElement }): ReactElement => {
  const [providers, setProviders] = useState<Web3ContextType>(initialWeb3Context)

  const chain = useCurrentChain()
  const wallet = useWallet()

  useEffect(() => {
    if (!chain || !wallet || chain.chainId !== wallet.chainId) {
      return
    }
    setProviders({
      web3: createWeb3Provider(wallet.provider),
      web3ReadOnly: createWeb3ReadOnlyProvider(chain),
    })
  }, [chain, wallet])

  return <Web3Context.Provider value={providers}>{children}</Web3Context.Provider>
}

export const useWeb3 = (): Web3ContextType['web3'] => {
  const context = useContext(Web3Context)
  if (context === undefined) {
    throw new Error('useWeb3 must be used within Web3Provider')
  }
  return context.web3
}

export const useWeb3ReadOnly = (): Web3ContextType['web3ReadOnly'] => {
  const context = useContext(Web3Context)
  if (context === undefined) {
    throw new Error('useWeb3ReadOnly must be used within Web3Provider')
  }
  return context.web3ReadOnly
}

export default Web3Provider
