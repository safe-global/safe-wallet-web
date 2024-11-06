import { useMemo } from 'react'
import Fuse from 'fuse.js'
import type { MultiChainSafeItem } from './useAllSafesGrouped'
import type { SafeItem } from './useAllSafes'
import { selectChains } from '@/store/chainsSlice'
import { useAppSelector } from '@/store'
import { isMultiChainSafeItem } from '@/features/multichain/utils/utils'

const useSafesSearch = (safes: (SafeItem | MultiChainSafeItem)[], query: string): (SafeItem | MultiChainSafeItem)[] => {
  const chains = useAppSelector(selectChains)

  // Include chain names in the search
  const safesWithChainNames = useMemo(
    () =>
      safes.map((safe) => {
        if (isMultiChainSafeItem(safe)) {
          const subChainNames = safe.safes.map(
            (subSafe) => chains.data.find((chain) => chain.chainId === subSafe.chainId)?.chainName,
          )
          return { ...safe, chainNames: subChainNames }
        }
        const chain = chains.data.find((chain) => chain.chainId === safe.chainId)
        return { ...safe, chainNames: [chain?.chainName] }
      }),
    [safes, chains.data],
  )

  const fuse = useMemo(
    () =>
      new Fuse(safesWithChainNames, {
        keys: [{ name: 'name' }, { name: 'address' }, { name: 'chainNames' }],
        threshold: 0.3,
        findAllMatches: true,
      }),
    [safesWithChainNames],
  )

  // Return results in the original format
  return useMemo(
    () =>
      query
        ? fuse.search(query).map((result) => {
            const { chainNames: _, ...safeWithoutChainNames } = result.item
            return safeWithoutChainNames
          })
        : [],
    [fuse, query],
  )
}

export { useSafesSearch }
