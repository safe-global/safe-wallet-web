import { DeploymentFilter, SingletonDeployment } from './types'
import semverSatisfies from 'semver/functions/satisfies'

const DEFAULT_FILTER: DeploymentFilter = { released: true }

export const findDeployment = (criteria: DeploymentFilter = DEFAULT_FILTER, deployments: SingletonDeployment[]): SingletonDeployment | undefined => {
  const criteriaWithDefaults: DeploymentFilter = { ...DEFAULT_FILTER, ...criteria }

  return deployments.find((deployment) => {
        if (typeof criteriaWithDefaults.version !== 'undefined' && !semverSatisfies(deployment.version, criteriaWithDefaults.version)) return false
        if (typeof criteriaWithDefaults.released === 'boolean' && deployment.released != criteriaWithDefaults.released) return false
        if (criteriaWithDefaults.network && !deployment.networkAddresses[criteriaWithDefaults.network]) return false

    return true
  })
}