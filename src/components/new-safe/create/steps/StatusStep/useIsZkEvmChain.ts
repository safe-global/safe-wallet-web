import useChainId from '@/hooks/useChainId'

enum ZkChains {
  ZKSYNC_ERA_MAINNET = '324',
  POLYGON_ZKEVM = '1101',
}

// TODO: Remove when we update SDK
export const useIsZkEvmChain = (): boolean => {
  const chainId = useChainId()

  return Object.values(ZkChains).includes(chainId as ZkChains)
}
