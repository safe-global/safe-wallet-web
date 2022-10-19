import { ReplaceTxHoverContext } from '@/components/transactions/GroupedTxListItems/ReplaceTxHoverProvider'
import { useAppSelector } from '@/store'
import { PendingStatus, selectPendingTxById } from '@/store/pendingTxsSlice'
import { isSignableBy, isUnsigned } from '@/utils/transaction-guards'
import type { TransactionSummary } from '@gnosis.pm/safe-react-gateway-sdk'
import { TransactionStatus } from '@gnosis.pm/safe-react-gateway-sdk'
import { useContext } from 'react'
import useWallet from './wallets/useWallet'

enum LocalStatus {
  WILL_BE_REPLACED = 'WILL_BE_REPLACED',
  DRAFT = 'DRAFT',
}

type TxLocalStatus = TransactionStatus | PendingStatus | LocalStatus

const STATUS_LABELS: Record<TxLocalStatus, string> = {
  [TransactionStatus.AWAITING_CONFIRMATIONS]: 'Awaiting confirmations',
  [TransactionStatus.AWAITING_EXECUTION]: 'Awaiting execution',
  [TransactionStatus.CANCELLED]: 'Cancelled',
  [TransactionStatus.FAILED]: 'Failed',
  [TransactionStatus.SUCCESS]: 'Success',
  [PendingStatus.SUBMITTING]: 'Submitting',
  [PendingStatus.PROCESSING]: 'Processing',
  [PendingStatus.INDEXING]: 'Indexing',
  [PendingStatus.SIGNING]: 'Signing',
  [LocalStatus.WILL_BE_REPLACED]: 'Transaction will be replaced',
  [LocalStatus.DRAFT]: 'Draft',
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

  if (isUnsigned(txSummary)) {
    return STATUS_LABELS[LocalStatus.DRAFT]
  }

  if (replacedTxIds.includes(id)) {
    return STATUS_LABELS[LocalStatus.WILL_BE_REPLACED]
  }

  const statuses = wallet?.address && isSignableBy(txSummary, wallet.address) ? WALLET_STATUS_LABELS : STATUS_LABELS

  return statuses[pendingTx?.status || txStatus] || ''
}

export default useTransactionStatus
