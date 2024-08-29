import { type SafeOverview } from '@safe-global/safe-gateway-typescript-sdk'
import { type SafeItem } from '../useAllSafes'
import { type UndeployedSafesState, type UndeployedSafe, type ReplayedSafeProps } from '@/store/slices'
import { sameAddress } from '@/utils/addresses'
import { type MultiChainSafeItem } from '../useAllSafesGrouped'
import { Safe_proxy_factory__factory } from '@/types/contracts'
import { keccak256, ethers, solidityPacked, getCreate2Address, type JsonRpcProvider } from 'ethers'
import { extractCounterfactualSafeSetup } from '@/features/counterfactual/utils'

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
    const undeployedSafeSetup = extractCounterfactualSafeSetup(undeployedSafe, undeployedSafesWithData[0].chainId)
    // Use first undeployed Safe
    comparisonSetup = undeployedSafeSetup
      ? {
          threshold: undeployedSafeSetup.threshold,
          owners: undeployedSafeSetup.owners,
        }
      : undefined
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
      const undeployedSafeItem = undeployedSafesWithData.find(
        (value) => value.chainId === safeItem.chainId && sameAddress(value.address, safeItem.address),
      )
      if (!undeployedSafeItem) {
        return false
      }

      const undeployedSafeSetup = extractCounterfactualSafeSetup(
        undeployedSafeItem.undeployedSafe,
        undeployedSafeItem.chainId,
      )
      if (!undeployedSafeSetup) {
        return false
      }

      return (
        areOwnersMatching(undeployedSafeSetup.owners, comparisonSetup.owners) &&
        undeployedSafeSetup.threshold === comparisonSetup.threshold
      )
    })
  ) {
    return comparisonSetup
  }
  return undefined
}

export const predictAddressBasedOnReplayData = async (
  safeCreationData: ReplayedSafeProps,
  provider: JsonRpcProvider,
) => {
  if (!safeCreationData.setupData) {
    throw new Error('Cannot predict address without setupData')
  }

  // Step 1: Hash the initializer
  const initializerHash = keccak256(safeCreationData.setupData)

  // Step 2: Encode the initializerHash and saltNonce using abi.encodePacked equivalent
  const encoded = ethers.concat([initializerHash, solidityPacked(['uint256'], [safeCreationData.saltNonce])])

  // Step 3: Hash the encoded value to get the final salt
  const salt = keccak256(encoded)

  // Get Proxy creation code
  const proxyCreationCode = await Safe_proxy_factory__factory.connect(
    safeCreationData.factoryAddress,
    provider,
  ).proxyCreationCode()

  const constructorData = safeCreationData.masterCopy
  const initCode = proxyCreationCode + solidityPacked(['uint256'], [constructorData]).slice(2)
  return getCreate2Address(safeCreationData.factoryAddress, salt, keccak256(initCode))
}
