import { useMemo } from 'react'
import uniq from 'lodash/uniq'
import isEmpty from 'lodash/isEmpty'
import { useAppSelector } from '@/store'
import { selectAllAddedSafes } from '@/store/addedSafesSlice'
import useChains from '@/hooks/useChains'
import useWallet from '@/hooks/wallets/useWallet'
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

const useAllSafes = (): SafeItems | undefined => {
  const { address: walletAddress = '' } = useWallet() || {}
  const [allOwned] = useAllOwnedSafes(walletAddress)
  const allAdded = useAddedSafes()
  const allUndeployed = useAppSelector(selectUndeployedSafes)
  const allVisitedSafes = useAppSelector(selectAllVisitedSafes)
  const { configs } = useChains()
  const allSafeNames = useAppSelector(selectAllAddressBooks)

  return useMemo<SafeItems>(() => {
    if (walletAddress && allOwned === undefined) {
      return []
    }
    const chains = uniq(Object.keys(allOwned || {}).concat(Object.keys(allAdded), Object.keys(allUndeployed)))
    chains.sort((a, b) => parseInt(a) - parseInt(b))

    return chains.flatMap((chainId) => {
      if (!configs.some((item) => item.chainId === chainId)) return []
      const addedOnChain = Object.keys(allAdded[chainId] || {})
      const ownedOnChain = (allOwned || {})[chainId]
      const undeployedOnChain = Object.keys(allUndeployed[chainId] || {})
      const uniqueAddresses = uniq(addedOnChain.concat(ownedOnChain, undeployedOnChain).filter(Boolean))
      uniqueAddresses.sort((a, b) => a.toLowerCase().localeCompare(b.toLowerCase()))

      return uniqueAddresses.map((address) => {
        const owners = allAdded?.[chainId]?.[address]?.owners
        const isPinned = !!allAdded?.[chainId]?.[address]
        const isOwner = owners?.some(({ value }) => sameAddress(walletAddress, value))
        const isOwned = (ownedOnChain || []).includes(address) || isOwner
        const lastVisited = allVisitedSafes?.[chainId]?.[address]?.lastVisited || 0
        const name = allSafeNames?.[chainId]?.[address]
        return {
          address,
          chainId,
          isReadOnly: !isOwned,
          isPinned,
          lastVisited,
          name,
        }
      })
    })
  }, [allAdded, allOwned, allUndeployed, configs, walletAddress, allVisitedSafes, allSafeNames])
}

export default useAllSafes
