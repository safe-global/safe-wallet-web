import { networks } from '@safe-global/protocol-kit/dist/src/utils/eip-3770/config'
import { type SafeVersion } from '@safe-global/safe-core-sdk-types'
import { getSafeSingletonDeployment } from '@safe-global/protocol-kit/node_modules/@safe-global/safe-deployments'
import semverSatisfies from 'semver/functions/satisfies'
import { LATEST_SAFE_VERSION } from './constants'

export const getLatestSafeVersion = (chainId?: string): SafeVersion => {
  // Without version filter it will always return the LATEST_SAFE_VERSION constant to avoid automatically updating to the newest version if the deployments change
  const latestVersion = (getSafeSingletonDeployment({ network: chainId, released: true })?.version ??
    '1.3.0') as SafeVersion

  // The version needs to be smaller or equal to the
  if (semverSatisfies(latestVersion, `<=${LATEST_SAFE_VERSION}`)) {
    return latestVersion
  } else {
    return LATEST_SAFE_VERSION as SafeVersion
  }
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
