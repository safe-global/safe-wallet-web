import { useMemo } from 'react'
import uniq from 'lodash/uniq'
import isEmpty from 'lodash/isEmpty'
import { useAppSelector } from '@/store'
import { selectAllAddedSafes } from '@/store/addedSafesSlice'
import useAllOwnedSafes from './useAllOwnedSafes'
import useChains from '@/hooks/useChains'
import useChainId from '@/hooks/useChainId'
import useWallet from '@/hooks/wallets/useWallet'

export type SafeItems = Array<{
  chainId: string
  address: string
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
  const hasAdded = isEmpty(allAdded)
  const [allOwned] = useAllOwnedSafes(!hasAdded ? address : '') // pass an empty string to not fetch owned safes
  return hasAdded || !isEmpty(allOwned)
}

const useAllSafes = (): SafeItems => {
  const { address = '' } = useWallet() || {}
  const [allOwned = {}] = useAllOwnedSafes(address)
  const allAdded = useAddedSafes()
  const { configs } = useChains()
  const currentChainId = useChainId()

  return useMemo<SafeItems>(() => {
    const chains = uniq([currentChainId].concat(Object.keys(allAdded)).concat(Object.keys(allOwned)))

    return chains.flatMap((chainId) => {
      if (!configs.some((item) => item.chainId === chainId)) return []
      const addedOnChain = Object.keys(allAdded[chainId] || {})
      const ownedOnChain = allOwned[chainId]
      const uniqueAddresses = uniq(addedOnChain.concat(ownedOnChain)).filter(Boolean)

      return uniqueAddresses.map((address) => ({
        address,
        chainId,
        threshold: allAdded[chainId]?.[address]?.threshold,
        owners: allAdded[chainId]?.[address]?.owners.length,
      }))
    })
  }, [configs, allAdded, allOwned, currentChainId])
}

export default useAllSafes
