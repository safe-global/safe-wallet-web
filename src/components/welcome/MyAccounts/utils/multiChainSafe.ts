import { type SafeOverview } from '@safe-global/safe-gateway-typescript-sdk'
import { type SafeItem } from '../useAllSafes'
import { type UndeployedSafe } from '@/store/slices'
import { sameAddress } from '@/utils/addresses'
import { type MultiChainSafeItem } from '../useAllSafesGrouped'

export const isMultiChainSafeItem = (safe: SafeItem | MultiChainSafeItem): safe is MultiChainSafeItem => {
  if ('safes' in safe && 'address' in safe) {
    return true
  }
  return false
}

const areOwnersMatching = (owners1: string[], owners2: string[]) =>
  owners1.every((owner) => owners2.some((owner2) => sameAddress(owner, owner2)))

export const getSharedSetup = (
  safes: SafeItem[],
  safeOverviews: SafeOverview[],
  undeployedSafe: UndeployedSafe | undefined,
): { owners: string[]; threshold: number } | undefined => {
  // We fetch one example setup and check that all other Safes have the same threshold and owners
  let comparisonSetup: { threshold: number; owners: string[] } | undefined = undefined
  if (safeOverviews && safeOverviews.length > 0) {
    comparisonSetup = {
      threshold: safeOverviews[0].threshold,
      owners: safeOverviews[0].owners.map((owner) => owner.value),
    }
  } else if (undeployedSafe) {
    // Use first undeployed Safe
    comparisonSetup = {
      threshold: undeployedSafe.props.safeAccountConfig.threshold,
      owners: undeployedSafe.props.safeAccountConfig.owners,
    }
  }
  if (!comparisonSetup) {
    return undefined
  }

  if (
    safes.every((safeItem) => {
      // Find overview or undeployed Safe
      const foundOverview = safeOverviews?.find((overview) => overview.chainId === safeItem.chainId)
      if (foundOverview) {
        return (
          areOwnersMatching(
            comparisonSetup.owners,
            foundOverview.owners.map((owner) => owner.value),
          ) && foundOverview.threshold === comparisonSetup.threshold
        )
      }
      // Compare with counterfactual Safe instead?
      if (!undeployedSafe) {
        return false
      }
      return (
        areOwnersMatching(undeployedSafe.props.safeAccountConfig.owners, comparisonSetup.owners) &&
        undeployedSafe.props.safeAccountConfig.threshold === comparisonSetup.threshold
      )
    })
  ) {
    return comparisonSetup
  }
  return undefined
}
