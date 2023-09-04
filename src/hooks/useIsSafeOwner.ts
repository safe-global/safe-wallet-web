import useSafeInfo from '@/hooks/useSafeInfo'
import useWallet from '@/hooks/wallets/useWallet'
import { isOwner } from '@/utils/transaction-guards'

const useIsSafeOwner = () => {
  const { safe } = useSafeInfo()
  const wallet = useWallet()

  return isOwner(safe.owners, wallet?.address)
}

export default useIsSafeOwner
