import type { AllOwnedSafes } from '@safe-global/safe-gateway-typescript-sdk'
import { useMemo } from 'react'
import uniq from 'lodash/uniq'
import isEmpty from 'lodash/isEmpty'
import { useAppSelector } from '@/store'
import type { AddedSafesState } from '@/store/addedSafesSlice'
import { selectAllAddedSafes } from '@/store/addedSafesSlice'
import useChains from '@/hooks/useChains'
import useWallet from '@/hooks/wallets/useWallet'
import type { AddressBookState, UndeployedSafesState, VisitedSafesState } from '@/store/slices'
import { selectAllAddressBooks, selectAllVisitedSafes, selectUndeployedSafes } from '@/store/slices'
import { sameAddress } from '@/utils/addresses'
import useAllOwnedSafes from './useAllOwnedSafes'

export type SafeItem = {
  chainId: string
  address: string
  isReadOnly: boolean
  isPinned: boolean
  lastVisited: number
  name: string | undefined
}

export type SafeItems = SafeItem[]

const useAddedSafes = () => {
  const allAdded = useAppSelector(selectAllAddedSafes)
  return allAdded
}

export const useHasSafes = () => {
  const { address = '' } = useWallet() || {}
  const allAdded = useAddedSafes()
  const hasAdded = !isEmpty(allAdded)
  const [allOwned] = useAllOwnedSafes(!hasAdded ? address : '') // pass an empty string to not fetch owned safes

  if (hasAdded) return { isLoaded: true, hasSafes: hasAdded }
  if (!allOwned) return { isLoaded: false }

  const hasOwned = !isEmpty(Object.values(allOwned).flat())
  return { isLoaded: true, hasSafes: hasOwned }
}

const mergeAndSortChainIds = (
  allOwned: AllOwnedSafes | undefined,
  allAdded: AddedSafesState,
  allUndeployed: UndeployedSafesState,
) => {
  const chainIds = uniq([...Object.keys(allOwned || {}), ...Object.keys(allAdded), ...Object.keys(allUndeployed)])
  chainIds.sort((a, b) => parseInt(a, 10) - parseInt(b, 10))

  return chainIds
}

const mergeAndSortAddresses = (
  chainId: string,
  allAdded: AddedSafesState,
  allOwned: AllOwnedSafes,
  allUndeployed: UndeployedSafesState,
): string[] => {
  const addedOnChain = Object.keys(allAdded[chainId] || {})
  const ownedOnChain = allOwned[chainId] || []
  const undeployedOnChain = Object.keys(allUndeployed[chainId] || {})

  const merged = [...addedOnChain, ...ownedOnChain, ...undeployedOnChain].filter(Boolean)
  const uniqueAddresses = uniq(merged)
  uniqueAddresses.sort((a, b) => a.toLowerCase().localeCompare(b.toLowerCase()))
  return uniqueAddresses
}

const buildSafeItem = (
  chainId: string,
  address: string,
  walletAddress: string,
  allAdded: AddedSafesState,
  allOwned: AllOwnedSafes,
  allVisitedSafes: VisitedSafesState,
  allSafeNames: AddressBookState,
): SafeItem => {
  const safeData = allAdded?.[chainId]?.[address]
  const owners = safeData?.owners || []
  const isPinned = Boolean(safeData)

  // Determine if the user is an owner
  const isOwnerFromAdded = owners.some(({ value }: { value: string }) => sameAddress(walletAddress, value))
  const isOwned = (allOwned[chainId] || []).includes(address) || isOwnerFromAdded

  const lastVisited = allVisitedSafes?.[chainId]?.[address]?.lastVisited || 0
  const name = allSafeNames?.[chainId]?.[address]

  return {
    chainId,
    address,
    isReadOnly: !isOwned,
    isPinned,
    lastVisited,
    name,
  }
}

const useAllSafes = (): SafeItems | undefined => {
  const { address: walletAddress = '' } = useWallet() || {}
  const [allOwned] = useAllOwnedSafes(walletAddress)
  const { configs } = useChains()
  const allAdded = useAddedSafes()
  const allUndeployed = useAppSelector(selectUndeployedSafes)
  const allVisitedSafes = useAppSelector(selectAllVisitedSafes)
  const allSafeNames = useAppSelector(selectAllAddressBooks)

  return useMemo<SafeItems>(() => {
    if (walletAddress && allOwned === undefined) return []

    const chainIds = mergeAndSortChainIds(allOwned, allAdded, allUndeployed)
    const validChainIds = chainIds.filter((chainId) => configs.some((item) => item.chainId === chainId))

    return validChainIds.flatMap((chainId) => {
      const uniqueAddresses = mergeAndSortAddresses(chainId, allAdded, allOwned || {}, allUndeployed)

      return uniqueAddresses.map((address) => {
        return buildSafeItem(chainId, address, walletAddress, allAdded, allOwned || {}, allVisitedSafes, allSafeNames)
      })
    })
  }, [allAdded, allOwned, allUndeployed, configs, walletAddress, allVisitedSafes, allSafeNames])
}

export default useAllSafes
