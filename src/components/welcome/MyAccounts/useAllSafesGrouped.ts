import { groupBy } from 'lodash'
import useAllSafes, { type SafeItem, type SafeItems } from './useAllSafes'
import { useMemo } from 'react'
import { sameAddress } from '@/utils/addresses'

export type MultiChainSafeItem = { address: string; safes: SafeItem[] }

export type AllSafesGrouped = {
  allSingleSafes: SafeItems | undefined
  allMultiChainSafes: MultiChainSafeItem[] | undefined
}

const getMultiChainAccounts = (safes: SafeItems): MultiChainSafeItem[] => {
  const groupedByAddress = groupBy(safes, (safe) => safe.address)
  const multiChainSafeItems = Object.entries(groupedByAddress)
    .filter((entry) => entry[1].length > 1)
    .map((entry): MultiChainSafeItem => ({ address: entry[0], safes: entry[1] }))

  return multiChainSafeItems
}

export const useAllSafesGrouped = () => {
  const allSafes = useAllSafes()

  return useMemo<AllSafesGrouped>(() => {
    if (!allSafes) {
      return { allMultiChainSafes: undefined, allSingleSafes: undefined }
    }
    // Extract all multichain Accounts and single Safes
    const allMultiChainSafes = getMultiChainAccounts(allSafes)
    const allSingleSafes = allSafes.filter(
      (safe) => !allMultiChainSafes.some((multiSafe) => sameAddress(multiSafe.address, safe.address)),
    )

    return {
      allMultiChainSafes,
      allSingleSafes,
    }
  }, [allSafes])
}
