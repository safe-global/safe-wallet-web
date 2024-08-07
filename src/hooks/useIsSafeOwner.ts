import useSafeInfo from '@/hooks/useSafeInfo'
import { useSigner } from '@/hooks/wallets/useWallet'
import { isOwner } from '@/utils/transaction-guards'

const useIsSafeOwner = () => {
  const { safe } = useSafeInfo()
  const signer = useSigner()

  return isOwner(safe.owners, signer?.address)
}

export default useIsSafeOwner
