import useSafeInfo from '@/hooks/useSafeInfo'
import useAllSafes from '@/components/welcome/MyAccounts/useAllSafes'
import { useMemo } from 'react'

export const useNestedSafeOwners = () => {
  const { safe, safeLoaded } = useSafeInfo()
  const allOwned = useAllSafes()

  const nestedSafeOwner = useMemo(() => {
    if (!safeLoaded || !allOwned) return null

    // Find an intersection of owned safes and the owners of the current safe
    const ownerAddresses = safe?.owners.map((owner) => owner.value)

    return allOwned.filter(
      (ownedSafe) =>
        !ownedSafe.isWatchlist && ownedSafe.chainId === safe.chainId && ownerAddresses?.includes(ownedSafe.address),
    )
  }, [allOwned, safe, safeLoaded])

  return nestedSafeOwner
}
