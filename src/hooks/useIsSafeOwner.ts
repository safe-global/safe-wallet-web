import useSafeInfo from '@/hooks/useSafeInfo'
import { isOwner } from '@/utils/transaction-guards'
import { useSigner } from './wallets/useWallet'

const useIsSafeOwner = () => {
  const { safe } = useSafeInfo()
  const signer = useSigner()

  return isOwner(safe.owners, signer?.address)
}

export default useIsSafeOwner
