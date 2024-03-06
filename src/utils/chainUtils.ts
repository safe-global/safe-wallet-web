import { chains } from '@particle-network/chains'
import { defineChain } from 'viem'

export const getViemChain = (chainId: number) => {
  const chain = chains.getEVMChainInfoById(chainId)
  if (!chain) {
    throw new Error(`The chain id ${chainId} is not supported.`)
  }

  return defineChain({
    id: chain.id,
    name: chain.fullname,
    nativeCurrency: chain.nativeCurrency,
    network: chain.network,
    rpcUrls: {
      public: {
        http: [chain.rpcUrl],
      },
      default: {
        http: [chain.rpcUrl],
      },
    },
    blockExplorers: {
      default: {
        name: 'Explorer',
        url: chain.blockExplorerUrl,
      },
    },
  })
}
