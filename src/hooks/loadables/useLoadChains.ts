import { useEffect } from 'react'
import { type ChainInfo } from '@safe-global/safe-gateway-typescript-sdk'
import useAsync, { type AsyncResult } from '../useAsync'
import { logError, Errors } from '@/services/exceptions'

const getConfigs = async (): Promise<ChainInfo[]> => {
  return [
    {
      chainId: '100',
      chainName: 'Gnosis Chain',
      description: '',
      chainLogoUri: 'https://safe-transaction-assets.safe.global/chains/100/chain_logo.png',
      l2: true,
      isTestnet: false,
      nativeCurrency: {
        name: 'xDai',
        symbol: 'XDAI',
        decimals: 18,
        logoUri: 'https://safe-transaction-assets.safe.global/chains/100/currency_logo.png',
      },
      transactionService: 'https://safe-transaction-gnosis-chain.safe.global',
      blockExplorerUriTemplate: {
        address: 'https://gnosisscan.io/address/{{address}}',
        txHash: 'https://gnosisscan.io/tx/{{txHash}}/',
        api: 'https://api.gnosisscan.io/api?module={{module}}&action={{action}}&address={{address}}&apiKey={{apiKey}}',
      },
      disabledWallets: [
        'detectedwallet',
        'keystone',
        'opera',
        'operaTouch',
        'safeMobile',
        'tally',
        'trust',
        'walletConnect_v2',
        'metamask',
        'trezor',
        'ledger',
        'coinbase',
      ],
      features: [
        'DEFAULT_TOKENLIST',
        'EIP1271',
        'EIP1559',
        'RELAYING',
        'SAFE_TX_GAS_OPTIONAL',
        'SOCIAL_LOGIN',
        'SPEED_UP_TX',
      ],
      gasPrice: [],
      publicRpcUri: {
        authentication: 'NO_AUTHENTICATION',
        value: 'https://rpc.gnosischain.com/',
      },
      rpcUri: {
        authentication: 'NO_AUTHENTICATION',
        value: 'https://rpc.gnosischain.com/',
      },
      safeAppsRpcUri: {
        authentication: 'NO_AUTHENTICATION',
        value: 'https://rpc.gnosischain.com/',
      },
      shortName: 'gno',
      theme: {
        textColor: '#ffffff',
        backgroundColor: '#48A9A6',
      },
    } as ChainInfo,
  ]
}

export const useLoadChains = (): AsyncResult<ChainInfo[]> => {
  const [data, error, loading] = useAsync<ChainInfo[]>(getConfigs, [])

  // Log errors
  useEffect(() => {
    if (error) {
      logError(Errors._620, error.message)
    }
  }, [error])

  return [data, error, loading]
}

export default useLoadChains
