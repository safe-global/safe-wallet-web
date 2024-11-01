import { useMemo } from 'react'
import uniq from 'lodash/uniq'
import isEmpty from 'lodash/isEmpty'
import { useAppSelector } from '@/store'
import { selectAllAddedSafes } from '@/store/addedSafesSlice'
import useAllOwnedSafes from './useAllOwnedSafes'
import useChains from '@/hooks/useChains'
import useWallet from '@/hooks/wallets/useWallet'
import { selectAllAddressBooks, selectAllVisitedSafes, selectUndeployedSafes } from '@/store/slices'
import { sameAddress } from '@/utils/addresses'
export type SafeItem = {
  chainId: string
  address: string
  isWatchlist: boolean
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

const useAllSafes = (): SafeItems | undefined => {
  const { address: walletAddress = '' } = useWallet() || {}
  const [allOwned] = useAllOwnedSafes(walletAddress)
  const allAdded = useAddedSafes()
  const allVisitedSafes = useAppSelector(selectAllVisitedSafes)
  const { configs } = useChains()
  const undeployedSafes = useAppSelector(selectUndeployedSafes)
  const allSafeNames = useAppSelector(selectAllAddressBooks)
  // [chainId]?.[address]

  return useMemo<SafeItems>(() => {
    if (walletAddress && allOwned === undefined) {
      return []
    }
    const chains = uniq(Object.keys(allOwned || {}).concat(Object.keys(allAdded)))
    // todo: replace with sortBy logic
    chains.sort((a, b) => parseInt(a) - parseInt(b))

    return chains.flatMap((chainId) => {
      if (!configs.some((item) => item.chainId === chainId)) return []
      const addedOnChain = Object.keys(allAdded[chainId] || {})
      const ownedOnChain = (allOwned || {})[chainId]
      const undeployedOnChain = Object.keys(undeployedSafes[chainId] || {})
      const uniqueAddresses = uniq(addedOnChain.concat(ownedOnChain)).filter(Boolean)
      // todo: replace with sortBy logic
      uniqueAddresses.sort((a, b) => a.toLowerCase().localeCompare(b.toLowerCase()))

      return uniqueAddresses.map((address) => {
        const owners = allAdded?.[chainId]?.[address]?.owners
        const isOwner = owners?.some(({ value }) => sameAddress(walletAddress, value))
        const isOwned = (ownedOnChain || []).includes(address) || isOwner
        const isUndeployed = undeployedOnChain.includes(address)
        const isPinned = Boolean(allAdded?.[chainId]?.[address]?.pinned)
        const lastVisited = allVisitedSafes?.[chainId]?.[address]?.lastVisited || 0
        const name = allSafeNames?.[chainId]?.[address]
        return {
          address,
          chainId,
          isWatchlist: !isOwned && !isUndeployed,
          isPinned,
          lastVisited,
          name,
        }
      })
    })
  }, [allAdded, allOwned, configs, undeployedSafes, walletAddress, allVisitedSafes, allSafeNames])
}

export default useAllSafes
