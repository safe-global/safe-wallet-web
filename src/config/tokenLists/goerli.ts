import type { ITokenList } from '@/components/safe-apps/types'

const goerli: ITokenList = {
  '0xc778417e063141139fce010982780140aa0cd5ab': {
    name: 'Wrapped Ether',
    symbol: 'WETH',
    decimals: 18,
    chainId: 4,
    logoURI:
      'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2/logo.png',
  },
  '0xc7ad46e0b8a400bb3c915120d284aafba8fc4735': {
    name: 'Dai Stablecoin',
    symbol: 'DAI',
    decimals: 18,
    chainId: 4,
    logoURI:
      'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0x6B175474E89094C44Da98b954EedeAC495271d0F/logo.png',
  },
  '0x332c7ac34580dfef553b7726549cec7015c4b39b': {
    name: 'Llama DAI',
    symbol: 'DAI',
    decimals: 18,
    chainId: 4,
    logoURI:
      'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0x6B175474E89094C44Da98b954EedeAC495271d0F/logo.png',
  },
  '0x0acbd07e458f228d4869066b998a0f55f36537b2': {
    chainId: 4,
    name: 'Llama USDT',
    symbol: 'USDT',
    decimals: 6,
    logoURI:
      'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/arbitrum/assets/0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9/logo.png',
  },
  '0x3861e9f29fcaff738906c7a3a495583ee7ca4c18': {
    chainId: 4,
    name: 'Llama USDC',
    symbol: 'USDC',
    decimals: 6,
    logoURI:
      'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48/logo.png',
  },
}

export default goerli
