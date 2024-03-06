import type { TempAPI } from '@/components/safe-apps/types'
import { checksumAddress } from '@/utils/addresses'

export const createOnboard = (currentAccount: string, chain: any, provider: any, switchChain: any): TempAPI => {
  // if (onboard) return onboard
  // let wallets = {}
  // try {
  //   wallets = getAllWallets(chain)
  // } catch (error) {
  //   console.log('GetAllWallets error', error)
  // }

  const stateData = {
    accountCenter: {
      enabled: false,
      position: 'bottomRight',
      expanded: false,
      minimal: true,
    },
    appMetadata: {
      name: 'Safe{Wallet}',
      icon: '/images/logo-round.svg',
      description: 'Safe{Wallet} – smart contract wallet for Ethereum (ex-Gnosis Safe multisig)',
    },
    chains: [
      {
        label: 'Ethereum',
        token: 'ETH',
        color: '#DDDDDD',
        publicRpcUrl: 'https://mainnet.infura.io/v3/',
        blockExplorerUrl: 'https://etherscan.io',
        namespace: 'evm',
        id: '0x1',
        rpcUrl: 'https://mainnet.infura.io/v3/ad2d3a5335064795a5f9b2e408206269',
      },
      {
        label: 'Polygon',
        token: 'MATIC',
        color: '#8248E5',
        publicRpcUrl: 'https://polygon-rpc.com/',
        blockExplorerUrl: 'https://polygonscan.com',
        namespace: 'evm',
        id: '0x89',
        rpcUrl: 'https://polygon-mainnet.infura.io/v3/ad2d3a5335064795a5f9b2e408206269',
      },
      {
        label: 'Optimism',
        token: 'OETH',
        color: '#F01A37',
        publicRpcUrl: 'https://mainnet.optimism.io/',
        blockExplorerUrl: 'https://optimistic.etherscan.io',
        namespace: 'evm',
        id: '0xa',
        rpcUrl: 'https://optimism-mainnet.infura.io/v3/ad2d3a5335064795a5f9b2e408206269',
      },
      {
        label: 'Sepolia',
        token: 'ETH',
        color: '#B8AAD5',
        publicRpcUrl: 'https://rpc.sepolia.org',
        blockExplorerUrl: 'https://sepolia.etherscan.io',
        namespace: 'evm',
        id: '0xaa36a7',
        rpcUrl: 'https://sepolia.infura.io/v3/ad2d3a5335064795a5f9b2e408206269',
      },
    ],
    connect: {
      showSidebar: true,
      disableClose: false,
      removeWhereIsMyWalletWarning: true,
      autoConnectLastWallet: false,
    },
    locale: '',
    notifications: [],
    notify: {},
    walletModules: [],
    wallets: [
      {
        accounts: [
          {
            address: checksumAddress(currentAccount),
            ens: null,
            uns: null,
            balance: {
              ETH: '',
            },
          },
        ],
        chains: [{ ...chain, id: chain.chainId }],
        icon: '',
        instance: '',
        label: '',
        provider,
        switchChain,
      },
    ],
  }
  return {
    connectWallet: async (...args: any) => {
      console.log('>>>>connectWallet', args)
      debugger
    },
    disconnectWallet: async (...args: any) => {
      console.log('>>>>disconnectWallet', args)
      debugger
    },
    setChain: async (...args: any) => {
      console.log('>>>>setChain', args)
      debugger
    },
    state: {
      get: (...args: any) => {
        return stateData
      },
      select: (key: string) => {
        debugger
        // @ts-ignore
        return stateData[key]
      },
      actions: {
        setWalletModules: (...args: any) => {
          console.log('>>>>setWalletModules', args)
          debugger
        },
        setLocale: (...args: any) => {
          console.log('>>>>setLocale', args)
          debugger
        },
        updateNotify: (...args: any) => {
          console.log('>>>>updateNotify', args)
          debugger
        },
        customNotification: (...args: any) => {
          console.log('>>>>customNotification', args)
          debugger
        },
        preflightNotifications: (...args: any) => {
          console.log('>>>>preflightNotifications', args)
          debugger
        },
        updateBalances: (...args: any) => {
          console.log('>>>>updateBalances', args)
          debugger
        },
        updateAccountCenter: (...args: any) => {
          console.log('>>>>updateAccountCenter', args)
          debugger
        },
        setPrimaryWallet: (...args: any) => {
          console.log('>>>>setPrimaryWallet', args)
          debugger
        },
        updateTheme: (...args: any) => {
          console.log('>>>>updateTheme', args)
          debugger
        },
        updateAppMetadata: (...args: any) => {
          console.log('>>>>updateAppMetadata', args)
          debugger
        },
      },
    },
  } as any
}
