import chains from '@/config/chains'
import type { SafeCollectibleResponse } from '@safe-global/safe-gateway-typescript-sdk'

type NftPlatform = {
  title: string
  logo: string
  getUrl: (nft: SafeCollectibleResponse) => string
}

export const nftPlatforms: Record<keyof typeof chains, Array<NftPlatform>> = {
  [chains.eth]: [
    {
      title: 'Etherscan',
      logo: '/images/common/nft-etherscan.svg',
      getUrl: (item) => `https://etherscan.io/nft/${item.address}/${item.id}`,
    },
    {
      title: 'OpenSea',
      logo: '/images/common/nft-opensea.svg',
      getUrl: (item) => `https://opensea.io/assets/${item.address}/${item.id}`,
    },
    {
      title: 'atomic0',
      logo: '/images/common/nft-atomic0.svg',
      getUrl: (item) => `https://atomic0.com/nft/${item.address}/${item.id}`,
    },
    {
      title: 'Blur',
      logo: '/images/common/nft-blur.svg',
      getUrl: (item) => `https://blur.io/asset/${item.address}/${item.id}`,
    },
  ],

  [chains.matic]: [
    {
      title: 'PolygonScan',
      logo: '/images/common/nft-polygonscan.svg',
      getUrl: (item) => `https://polygonscan.com/token/${item.address}?a=${item.id}`,
    },
    {
      title: 'OpenSea',
      logo: '/images/common/nft-opensea.svg',
      getUrl: (item) => `https://opensea.io/matic/${item.address}/${item.id}`,
    },
  ],

  [chains.gno]: [
    {
      title: 'GnosisScan',
      logo: '/images/common/nft-gnosisscan.svg',
      getUrl: (item) => `https://gnosisscan.io/nft/${item.address}/${item.id}`,
    },
  ],
}
