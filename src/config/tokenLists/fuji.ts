import type { ITokenList } from '@/components/safe-apps/types'

const CHAIN_ID = 43113

const fuji: ITokenList = {
  '0x36861654d8e5e0a641085603a8e7cb88e5419d31': {
    chainId: CHAIN_ID,
    name: 'Llama DAI',
    symbol: 'DAI',
    decimals: 18,
    logoURI:
      'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0x6B175474E89094C44Da98b954EedeAC495271d0F/logo.png',
  },
  '0xaf64a37533e76a2ff19dda45806c157037a30fad': {
    chainId: CHAIN_ID,

    name: 'Llama WBTC',
    symbol: 'WBTC',
    decimals: 8,
    logoURI:
      'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599/logo.png',
  },
  '0x8cf18401b5cc31176be8f9d6f586a64506b583f1': {
    chainId: CHAIN_ID,
    name: 'Llama USDT',
    symbol: 'USDT',
    decimals: 6,
    logoURI:
      'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/arbitrum/assets/0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9/logo.png',
  },
  '0x330f5b4784100d8ed4defb8d80c411bda435205c': {
    chainId: CHAIN_ID,
    name: 'Llama WETH',
    symbol: 'WETH',
    decimals: 18,
    logoURI:
      'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2/logo.png',
  },
  '0x68b56283f6c6ac75489b63d09288dfa2bea104a1': {
    chainId: CHAIN_ID,
    name: 'Llama USDC',
    symbol: 'USDC',
    decimals: 6,
    logoURI:
      'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48/logo.png',
  },
}

export default fuji
