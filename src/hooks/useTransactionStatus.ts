import { ReplaceTxHoverContext } from '@/components/transactions/GroupedTxListItems/ReplaceTxHoverProvider'
import { useAppSelector } from '@/store'
import { PendingStatus, selectPendingTxById } from '@/store/pendingTxsSlice'
import { isSignableBy } from '@/utils/transaction-guards'
import { TransactionSummary, TransactionStatus } from '@gnosis.pm/safe-react-gateway-sdk'
import { useContext } from 'react'
import useWallet from './wallets/useWallet'

type TxLocalStatus = TransactionStatus | PendingStatus | 'WILL_BE_REPLACED'

const STATUS_LABELS: Record<TxLocalStatus, string> = {
  [TransactionStatus.AWAITING_CONFIRMATIONS]: 'Awaiting confirmations',
  [TransactionStatus.AWAITING_EXECUTION]: 'Awaiting execution',
  [TransactionStatus.CANCELLED]: 'Cancelled',
  [TransactionStatus.FAILED]: 'Failed',
  [TransactionStatus.SUCCESS]: 'Success',
  [PendingStatus.SUBMITTING]: 'Submitting',
  [PendingStatus.PROCESSING]: 'Processing',
  [PendingStatus.INDEXING]: 'Indexing',
  WILL_BE_REPLACED: 'Transaction will be replaced',
}

const WALLET_STATUS_LABELS: Record<TxLocalStatus, string> = {
  ...STATUS_LABELS,
  [TransactionStatus.AWAITING_CONFIRMATIONS]: 'Needs your confirmation',
}

const useTransactionStatus = (txSummary: TransactionSummary): string => {
  const { txStatus, id } = txSummary

  const { replacedTxIds } = useContext(ReplaceTxHoverContext)
  const wallet = useWallet()
  const pendingTx = useAppSelector((state) => selectPendingTxById(state, id))

  if (replacedTxIds.includes(id)) {
    return STATUS_LABELS['WILL_BE_REPLACED']
  }

  const statuses = wallet?.address && isSignableBy(txSummary, wallet.address) ? WALLET_STATUS_LABELS : STATUS_LABELS

  return statuses[pendingTx?.status || txStatus] || ''
}

export default useTransactionStatus
