import { useMemo } from 'react'
import Fuse from 'fuse.js'
import type { MultiChainSafeItem } from './useAllSafesGrouped'
import type { SafeItem } from './useAllSafes'

const useSafesSearch = (safes: (SafeItem | MultiChainSafeItem)[], query: string) => {
  const fuse = useMemo(
    () =>
      new Fuse(safes, {
        keys: [{ name: 'name' }],
        threshold: 0.3,
        findAllMatches: true,
      }),
    [safes],
  )

  const results = useMemo(() => (query ? fuse.search(query).map((result) => result.item) : []), [fuse, query])

  return results
}

export { useSafesSearch }
