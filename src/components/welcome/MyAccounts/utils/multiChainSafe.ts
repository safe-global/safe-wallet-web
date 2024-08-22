import { type SafeOverview } from '@safe-global/safe-gateway-typescript-sdk'
import { type SafeItem } from '../useAllSafes'
import { type UndeployedSafesState, type UndeployedSafe } from '@/store/slices'
import { sameAddress } from '@/utils/addresses'
import { type MultiChainSafeItem } from '../useAllSafesGrouped'

export const isMultiChainSafeItem = (safe: SafeItem | MultiChainSafeItem): safe is MultiChainSafeItem => {
  if ('safes' in safe && 'address' in safe) {
    return true
  }
  return false
}

const areOwnersMatching = (owners1: string[], owners2: string[]) =>
  owners1.length === owners2.length && owners1.every((owner) => owners2.some((owner2) => sameAddress(owner, owner2)))

export const getSharedSetup = (
  safes: SafeItem[],
  safeOverviews: SafeOverview[],
  undeployedSafes: UndeployedSafesState | undefined,
): { owners: string[]; threshold: number } | undefined => {
  // We fetch one example setup and check that all other Safes have the same threshold and owners
  let comparisonSetup: { threshold: number; owners: string[] } | undefined = undefined

  const undeployedSafesWithData = safes
    .map((safeItem) => ({
      chainId: safeItem.chainId,
      address: safeItem.address,
      undeployedSafe: undeployedSafes?.[safeItem.chainId]?.[safeItem.address],
    }))
    .filter((value) => Boolean(value.undeployedSafe)) as {
    chainId: string
    address: string
    undeployedSafe: UndeployedSafe
  }[]

  if (safeOverviews && safeOverviews.length > 0) {
    comparisonSetup = {
      threshold: safeOverviews[0].threshold,
      owners: safeOverviews[0].owners.map((owner) => owner.value),
    }
  } else if (undeployedSafesWithData.length > 0) {
    const undeployedSafe = undeployedSafesWithData[0].undeployedSafe
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
      const foundOverview = safeOverviews?.find(
        (overview) => overview.chainId === safeItem.chainId && sameAddress(overview.address.value, safeItem.address),
      )
      if (foundOverview) {
        return (
          areOwnersMatching(
            comparisonSetup.owners,
            foundOverview.owners.map((owner) => owner.value),
          ) && foundOverview.threshold === comparisonSetup.threshold
        )
      }
      // Check if the Safe is counterfactual
      const undeployedSafe = undeployedSafesWithData.find(
        (value) => value.chainId === safeItem.chainId && sameAddress(value.address, safeItem.address),
      )?.undeployedSafe
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
