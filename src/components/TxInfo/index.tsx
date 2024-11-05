import React from 'react'
import { TransactionInfoType, TransactionSummary } from '@safe-global/safe-gateway-typescript-sdk'

import { useTransactionType } from '@/src/hooks/useTransactionType'
import TxTokenCard from '@/src/components/transactions-list/Card/TxTokenCard'
import TxSettingsCard from '@/src/components/transactions-list/Card/TxSettingsCard'
import {
  isCancellationTxInfo,
  isCreationTxInfo,
  isMultiSendTxInfo,
  isOrderTxInfo,
  isSettingsChangeTxInfo,
  isSwapOrderTxInfo,
  isTransferTxInfo,
} from '@/src/utils/transaction-guards'
import TxBatchCard from '@/src/components/transactions-list/Card/TxBatchCard'
import TxSafeAppCard from '@/src/components/transactions-list/Card/TxSafeAppCard'
import TxCreationCard from '@/src/components/transactions-list/Card/TxCreationCard'
import TxRejectionCard from '@/src/components/transactions-list/Card/TxRejectionCard'
import TxContractInteractionCard from '@/src/components/transactions-list/Card/TxContractInteractionCard'
import TxSwapCard from '@/src/components/transactions-list/Card/TxSwapCard'

interface TxInfoProps {
  tx: TransactionSummary
  bordered?: boolean
}

function TxInfo({ tx, bordered }: TxInfoProps) {
  const txType = useTransactionType(tx)

  const txInfo = tx.txInfo
  if (isTransferTxInfo(txInfo)) {
    return <TxTokenCard bordered={bordered} txInfo={txInfo} txStatus={tx.txStatus} />
  }

  if (isSettingsChangeTxInfo(txInfo)) {
    return <TxSettingsCard bordered={bordered} txInfo={txInfo} />
  }

  if (isMultiSendTxInfo(txInfo) && tx.txInfo.type === TransactionInfoType.CUSTOM) {
    return <TxBatchCard label={txType.text} bordered={bordered} txInfo={txInfo} />
  }

  if (isMultiSendTxInfo(txInfo) && tx.safeAppInfo) {
    return <TxSafeAppCard bordered={bordered} txInfo={txInfo} safeAppInfo={tx.safeAppInfo} />
  }

  if (isCreationTxInfo(txInfo)) {
    return <TxCreationCard bordered={bordered} txInfo={txInfo} />
  }

  if (isCancellationTxInfo(txInfo)) {
    return <TxRejectionCard bordered={bordered} txInfo={txInfo} />
  }

  if (!isOrderTxInfo(txInfo)) {
    return <TxContractInteractionCard bordered={bordered} txInfo={txInfo} />
  }

  if (isSwapOrderTxInfo(txInfo)) {
    return <TxSwapCard txInfo={txInfo} />
  }

  return <></>
}

export default React.memo(TxInfo, (prevProps, nextProps) => {
  return prevProps.tx.txHash === nextProps.tx.txHash
})
