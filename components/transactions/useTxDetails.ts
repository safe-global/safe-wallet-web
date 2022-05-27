import type { TransactionDetails } from '@gnosis.pm/safe-react-gateway-sdk'

import { useAppSelector } from '@/store'
import { selectTxDetails } from '@/store/txDetailsSlice'

const useTxDetails = ({ txId }: { txId: string }): TransactionDetails | undefined => {
  const txDetails = useAppSelector((state) => selectTxDetails(state, txId))
  return txDetails
}

export default useTxDetails
