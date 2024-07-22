import { useNestedSafeOwners } from '@/components/dashboard/NestedSafeBanner'
import useSafeInfo from '@/hooks/useSafeInfo'
import useWallet from '@/hooks/wallets/useWallet'
import { isOwner } from '@/utils/transaction-guards'

const useIsSafeOwner = () => {
  const { safe } = useSafeInfo()
  const wallet = useWallet()

  const nestedOwners = useNestedSafeOwners()

  return isOwner(safe.owners, wallet?.address) || (nestedOwners && nestedOwners.length > 0)
}

export default useIsSafeOwner
