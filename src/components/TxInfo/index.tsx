import React from 'react'
import { TransactionInfoType } from '@/src/store/gateway/types'
import { type Transaction } from '@/src/store/gateway/AUTO_GENERATED/transactions'
import { useTransactionType } from '@/src/hooks/useTransactionType'
import TxTokenCard from '@/src/components/transactions-list/Card/TxTokenCard'
import TxSettingsCard from '@/src/components/transactions-list/Card/TxSettingsCard'
import {
  isCancellationTxInfo,
  isCreationTxInfo,
  isCustomTxInfo,
  isMultiSendTxInfo,
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
  tx: Transaction
  bordered?: boolean
  inQueue?: boolean
}

function TxInfo({ tx, bordered, inQueue }: TxInfoProps) {
  const txType = useTransactionType(tx)

  const txInfo = tx.txInfo
  if (isTransferTxInfo(txInfo)) {
    return (
      <TxTokenCard
        executionInfo={tx.executionInfo}
        inQueue={inQueue}
        bordered={bordered}
        txInfo={txInfo}
        txStatus={tx.txStatus}
      />
    )
  }

  if (isSettingsChangeTxInfo(txInfo)) {
    return <TxSettingsCard executionInfo={tx.executionInfo} inQueue={inQueue} bordered={bordered} txInfo={txInfo} />
  }

  if (isMultiSendTxInfo(txInfo) && tx.txInfo.type === TransactionInfoType.CUSTOM) {
    return (
      <TxBatchCard
        executionInfo={tx.executionInfo}
        inQueue={inQueue}
        label={txType.text}
        bordered={bordered}
        txInfo={txInfo}
      />
    )
  }

  if (isMultiSendTxInfo(txInfo) && tx.safeAppInfo) {
    return (
      <TxSafeAppCard
        executionInfo={tx.executionInfo}
        inQueue={inQueue}
        bordered={bordered}
        txInfo={txInfo}
        safeAppInfo={tx.safeAppInfo}
      />
    )
  }

  if (isCreationTxInfo(txInfo)) {
    return <TxCreationCard executionInfo={tx.executionInfo} inQueue={inQueue} bordered={bordered} txInfo={txInfo} />
  }

  if (isCancellationTxInfo(txInfo)) {
    return <TxRejectionCard executionInfo={tx.executionInfo} inQueue={inQueue} bordered={bordered} txInfo={txInfo} />
  }

  if (isMultiSendTxInfo(txInfo) || isCustomTxInfo(txInfo)) {
    return (
      <TxContractInteractionCard
        executionInfo={tx.executionInfo}
        inQueue={inQueue}
        bordered={bordered}
        txInfo={txInfo}
      />
    )
  }

  if (isSwapOrderTxInfo(txInfo)) {
    return <TxSwapCard executionInfo={tx.executionInfo} inQueue={inQueue} txInfo={txInfo} />
  }

  return <></>
}

export default React.memo(TxInfo, (prevProps, nextProps) => {
  return prevProps.tx.txHash === nextProps.tx.txHash
})
