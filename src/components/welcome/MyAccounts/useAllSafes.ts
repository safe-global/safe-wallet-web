import { useMemo } from 'react'
import uniq from 'lodash/uniq'
import isEmpty from 'lodash/isEmpty'
import { useAppSelector } from '@/store'
import { selectAllAddedSafes } from '@/store/addedSafesSlice'
import useAllOwnedSafes from './useAllOwnedSafes'
import useChains from '@/hooks/useChains'
import useWallet from '@/hooks/wallets/useWallet'
import { selectUndeployedSafes } from '@/store/slices'
import { sameAddress } from '@/utils/addresses'

export type SafeItems = Array<{
  chainId: string
  address: string
  isReadOnly: boolean
  isBookmarked: boolean
  threshold?: number
  owners?: number
}>

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
  const { configs } = useChains()
  const undeployedSafes = useAppSelector(selectUndeployedSafes)

  return useMemo<SafeItems>(() => {
    const chains = configs.map(({ chainId }) => chainId)

    return chains.flatMap((chainId) => {
      if (!configs.some((item) => item.chainId === chainId)) return []
      const addedOnChain = Object.keys(allAdded[chainId] || {})
      const ownedOnChain = (allOwned || {})[chainId] || []
      const undeployedOnChain = Object.keys(undeployedSafes[chainId] || {})
      const uniqueAddresses = uniq(ownedOnChain.concat(addedOnChain)).filter(Boolean)
      return uniqueAddresses.map((address) => {
        const owners = allAdded?.[chainId]?.[address]?.owners
        const isOwner = owners?.some(({ value }) => sameAddress(walletAddress, value))
        const isUndeployed = undeployedOnChain.includes(address)
        const isOwned = ownedOnChain.includes(address) || isOwner
        const isBookmarked = addedOnChain.some((addedAddress) => addedAddress === address)
        return {
          address,
          chainId,
          isReadOnly: !isOwned && !isUndeployed,
          isBookmarked,
          threshold: allAdded[chainId]?.[address]?.threshold,
          owners: allAdded[chainId]?.[address]?.owners.length,
        }
      })
    })
  }, [allAdded, allOwned, configs, undeployedSafes, walletAddress])
}

export default useAllSafes
