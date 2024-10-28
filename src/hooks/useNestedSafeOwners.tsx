import useSafeInfo from '@/hooks/useSafeInfo'
import { useMemo } from 'react'
import useAllOwnedSafes from '@/components/welcome/MyAccounts/useAllOwnedSafes'
import useWallet from './wallets/useWallet'

export const useNestedSafeOwners = () => {
  const { safe, safeLoaded } = useSafeInfo()
  const wallet = useWallet()
  const [allOwned] = useAllOwnedSafes(wallet?.address ?? '')
  allOwned

  const nestedSafeOwner = useMemo(() => {
    if (!safeLoaded || !allOwned) return null

    // Find an intersection of owned safes and the owners of the current safe
    const ownerAddresses = safe?.owners.map((owner) => owner.value)

    return allOwned[safe.chainId]?.filter((ownedSafe) => ownerAddresses?.includes(ownedSafe))
  }, [allOwned, safe, safeLoaded])

  return nestedSafeOwner
}
