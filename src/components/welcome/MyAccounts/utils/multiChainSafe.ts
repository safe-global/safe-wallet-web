import { type SafeOverview } from '@safe-global/safe-gateway-typescript-sdk'
import { type SafeItem } from '../useAllSafes'
import { type UndeployedSafesState, type ReplayedSafeProps } from '@/store/slices'
import { sameAddress } from '@/utils/addresses'
import { type MultiChainSafeItem } from '../useAllSafesGrouped'
import { Safe_proxy_factory__factory } from '@/types/contracts'
import { keccak256, ethers, solidityPacked, getCreate2Address, type JsonRpcProvider } from 'ethers'
import { extractCounterfactualSafeSetup } from '@/features/counterfactual/utils'

type SafeSetup = {
  owners: string[]
  threshold: number
  chainId: string
}

export const isMultiChainSafeItem = (safe: SafeItem | MultiChainSafeItem): safe is MultiChainSafeItem => {
  if ('safes' in safe && 'address' in safe) {
    return true
  }
  return false
}

const areOwnersMatching = (owners1: string[], owners2: string[]) =>
  owners1.length === owners2.length && owners1.every((owner) => owners2.some((owner2) => sameAddress(owner, owner2)))

export const getSafeSetups = (
  safes: SafeItem[],
  safeOverviews: SafeOverview[],
  undeployedSafes: UndeployedSafesState,
): (SafeSetup | undefined)[] => {
  const safeSetups = safes.map((safeItem) => {
    const undeployedSafe = undeployedSafes?.[safeItem.chainId]?.[safeItem.address]
    if (undeployedSafe) {
      const counterfactualSetup = extractCounterfactualSafeSetup(undeployedSafe, safeItem.chainId)
      if (!counterfactualSetup) return undefined
      return {
        owners: counterfactualSetup.owners,
        threshold: counterfactualSetup.threshold,
        chainId: safeItem.chainId,
      }
    }
    const foundOverview = safeOverviews?.find(
      (overview) => overview.chainId === safeItem.chainId && sameAddress(overview.address.value, safeItem.address),
    )
    if (!foundOverview) return undefined
    return {
      owners: foundOverview.owners.map((owner) => owner.value),
      threshold: foundOverview.threshold,
      chainId: safeItem.chainId,
    }
  })
  return safeSetups
}

export const getSharedSetup = (safeSetups: (SafeSetup | undefined)[]): Omit<SafeSetup, 'chainId'> | undefined => {
  const comparisonSetup = safeSetups[0]

  if (!comparisonSetup) return undefined

  const allMatching = safeSetups.every(
    (setup) =>
      setup && areOwnersMatching(setup.owners, comparisonSetup.owners) && setup.threshold === comparisonSetup.threshold,
  )

  const { owners, threshold } = comparisonSetup
  return allMatching ? { owners, threshold } : undefined
}

export const getDeviatingSetups = (
  safeSetups: (SafeSetup | undefined)[],
  currentChainId: string | undefined,
): SafeSetup[] => {
  const currentSafeSetup = safeSetups.find((setup) => setup?.chainId === currentChainId)
  if (!currentChainId || !currentSafeSetup) return []

  const deviatingSetups = safeSetups
    .filter((setup): setup is SafeSetup => Boolean(setup))
    .filter((setup) => {
      return (
        setup &&
        (!areOwnersMatching(setup.owners, currentSafeSetup.owners) || setup.threshold !== currentSafeSetup.threshold)
      )
    })
  return deviatingSetups
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
