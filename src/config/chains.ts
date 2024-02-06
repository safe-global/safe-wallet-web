import { networks } from '@safe-global/protocol-kit/dist/src/utils/eip-3770/config'
/**
 * A static shortName<->chainId dictionary
 * E.g.:
 *
 * {
 *   eth: '1',
 *   gor: '5',
 *   ...
 * }
 */
type Chains = Record<string, string>

const chains = networks.reduce<Chains>((result, { shortName, chainId }) => {
  result[shortName] = chainId.toString()
  return result
}, {})

const ChainLogos = {
  [chains.eth]: '/images/networks/mainnet.svg',
  [chains.bnb]: '/images/networks/bnb.svg',
  [chains.oeth]: '/images/networks/optimism.svg',
  [chains.gno]: '/images/networks/gno.png',
  [chains.matic]: '/images/networks/polygon.svg',
  [chains.aurora]: '/images/networks/aurora.svg',
  [chains.base]: '/images/networks/base.svg',
  [chains.basegor]: '/images/networks/base.svg',
  [chains.basesep]: '/images/networks/base.svg',
  [chains.zkevm]: '/images/networks/polygon.svg',
  [chains.zksync]: '/images/networks/zksync.svg',
  [chains.celo]: '/images/networks/celo.svg',
  [chains.gor]: '/images/networks/gor.svg',
  [chains.arb1]: '/images/networks/arb.svg',
  [chains.avax]: '/images/networks/avax.svg',
  [chains.sep]: '/images/networks/sep.png',
}

export const getChainLogo = (chainId: string) => {
  return ChainLogos[chainId]
}

export default chains
