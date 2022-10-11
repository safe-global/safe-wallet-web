import type { ChainInfo } from '@gnosis.pm/safe-react-gateway-sdk'
import { FEATURES, RPC_AUTHENTICATION } from '@gnosis.pm/safe-react-gateway-sdk'

const PULSE_CHAIN: ChainInfo[] = [
  {
    transactionService: 'https://safe-transaction.pulsechain.gnosis.io',
    chainId: '941',
    chainName: 'Pulse Chain Testnet',
    shortName: 'tpls',
    l2: true,
    description: '',
    rpcUri: { authentication: RPC_AUTHENTICATION.NO_AUTHENTICATION, value: 'https://rpc.v2b.testnet.pulsechain.com' },
    safeAppsRpcUri: {
      authentication: RPC_AUTHENTICATION.NO_AUTHENTICATION,
      value: 'https://rpc.v2b.testnet.pulsechain.com',
    },
    publicRpcUri: {
      authentication: RPC_AUTHENTICATION.NO_AUTHENTICATION,
      value: 'https://rpc.v2b.testnet.pulsechain.com',
    },
    blockExplorerUriTemplate: {
      address: 'https://scan.v2b.testnet.pulsechain.com/address/{{address}}',
      txHash: 'https://scan.v2b.testnet.pulsechain.com/tx/{{txHash}}',
      api: 'https://scan.v2b.testnet.pulsechain.com/api?module={{module}}&action={{action}}&address={{address}}&apiKey={{apiKey}}',
    },
    nativeCurrency: {
      name: 'Pulse Testnet',
      symbol: 'TPLS',
      decimals: 18,
      logoUri: 'https://pulsechain.com/img/wordmark.png',
    },
    theme: { textColor: '#FFFFFF', backgroundColor: '#7703FF' },
    gasPrice: [],
    disabledWallets: [
      'authereum',
      'fortmatic',
      'keystone',
      'lattice',
      'ledger',
      'opera',
      'operaTouch',
      'portis',
      'torus',
      'trezor',
      'trust',
      'walletLink',
    ],
    features: [
      FEATURES.CONTRACT_INTERACTION,
      FEATURES.EIP1559,
      FEATURES.ERC721,
      FEATURES.SAFE_APPS,
      FEATURES.SAFE_TX_GAS_OPTIONAL,
      FEATURES.SPENDING_LIMIT,
      FEATURES.TX_SIMULATION,
    ],
  },
]

export { PULSE_CHAIN }
