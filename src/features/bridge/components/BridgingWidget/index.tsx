import useSafeInfo from '@/hooks/useSafeInfo'
import useSafeWalletProvider from '@/services/safe-wallet-provider/useSafeWalletProvider'
import { LiFiWidget, type WidgetConfig } from '@lifi/widget'
import type { Address } from 'viem'
import { http, createConfig, WagmiProvider, createConnector } from 'wagmi'
import { gnosis, sepolia } from 'wagmi/chains'

const widgetConfig: WidgetConfig = {
  integrator: 'safe-app',
  fromChain: gnosis.id,
  theme: {
    container: {
      border: '1px solid rgb(234, 234, 234)',
      borderRadius: '16px',
    },
  },
}

const BridgingWidget = () => {
  const walletProvider = useSafeWalletProvider()
  const safeInfo = useSafeInfo()

  if (!walletProvider) {
    return null
  }

  const customConnector = createConnector((config) => {
    return {
      id: 'test',
      name: 'Test Connector',
      type: 'test',
      async setup() {},
      async connect() {
        return { accounts: [safeInfo.safeAddress] as Address[], chainId: Number(safeInfo.safe.chainId) }
      },
      async disconnect() {},
      async getAccounts() {
        return [safeInfo.safeAddress] as Address[]
      },
      async getChainId() {
        return Number(safeInfo.safe.chainId)
      },
      async isAuthorized() {
        return true // TODO: check if authorized, connected wallet must be owner or delefate
      },
      // async switchChain({ chainId }) {
      //   const provider = await this.getProvider()
      //   const chain = config.chains.find((x) => x.id === chainId)
      //   if (!chain) throw new SwitchChainError(new ChainNotConfiguredError())

      //   await provider.request({
      //     method: 'wallet_switchEthereumChain',
      //     params: [{ chainId: numberToHex(chainId) }],
      //   })
      //   return chain
      // },
      onAccountsChanged() {
        config.emitter.emit('change', {
          accounts: [safeInfo.safeAddress] as Address[],
        })
      },
      onChainChanged(chain) {
        const chainId = Number(chain)
        config.emitter.emit('change', { chainId })
      },
      async onDisconnect() {},
      async getProvider() {
        return walletProvider
      },
    }
  })

  const config = createConfig({
    chains: [sepolia, gnosis],
    connectors: [customConnector],
    transports: {
      [sepolia.id]: http(),
      [gnosis.id]: http(),
    },
  })

  return (
    <WagmiProvider config={config} reconnectOnMount>
      <LiFiWidget integrator="safe-app" config={widgetConfig} />
    </WagmiProvider>
  )
}

export default BridgingWidget
