import { networks } from '@safe-global/safe-core-sdk-utils/dist/src/eip-3770/config'

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

const chains: Chains = networks.reduce((result, { shortName, chainId }) => {
  result[shortName] = chainId.toString()
  return result
}, {} as Chains)

export default chains
