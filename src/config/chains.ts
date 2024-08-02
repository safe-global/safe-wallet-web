import { networks } from '@safe-global/protocol-kit/dist/src/utils/eip-3770/config'
import { type SafeVersion } from '@safe-global/safe-core-sdk-types'
import { getSafeSingletonDeployment } from '@safe-global/protocol-kit/node_modules/@safe-global/safe-deployments'

export const getLatestSafeVersion = (chainId?: string): SafeVersion => {
  // Without version filter it will always return the latest
  return (getSafeSingletonDeployment({ network: chainId, released: true })?.version ?? '1.3.0') as SafeVersion
}

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

export default chains
