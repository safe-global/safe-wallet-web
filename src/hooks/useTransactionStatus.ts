import { useAppSelector } from '@/store'
import { PendingStatus, selectPendingTxById } from '@/store/pendingTxsSlice'
import { sameAddress } from '@/utils/addresses'
import { isMultisigExecutionInfo } from '@/utils/transaction-guards'
import { TransactionSummary, TransactionStatus } from '@gnosis.pm/safe-react-gateway-sdk'
import { useMemo } from 'react'
import useWallet from './wallets/useWallet'

type TxLocalStatus = TransactionStatus | PendingStatus

const hasSignature = (executionInfo: TransactionSummary['executionInfo'], address?: string) => {
  return isMultisigExecutionInfo(executionInfo)
    ? executionInfo.missingSigners?.some((signer) => sameAddress(signer.value, address))
    : false
}

const useTransactionStatus = ({ txStatus, id, executionInfo }: TransactionSummary): string => {
  const wallet = useWallet()
  const pendingTx = useAppSelector((state) => selectPendingTxById(state, id))

  const STATUS_LABELS: Record<TxLocalStatus, string> = useMemo(
    () => ({
      [TransactionStatus.AWAITING_CONFIRMATIONS]: hasSignature(executionInfo, wallet?.address)
        ? 'Needs your confirmation'
        : 'Needs confirmations',
      [TransactionStatus.AWAITING_EXECUTION]: 'Awaiting execution',
      [TransactionStatus.CANCELLED]: 'Cancelled',
      [TransactionStatus.FAILED]: 'Failed',
      [TransactionStatus.SUCCESS]: 'Success',
      [PendingStatus.SUBMITTING]: 'Submitting',
      [PendingStatus.MINING]: 'Mining',
      [PendingStatus.INDEXING]: 'Indexing',
    }),
    [executionInfo, wallet?.address],
  )

  return STATUS_LABELS[pendingTx?.status || txStatus] || ''
}

export default useTransactionStatus
