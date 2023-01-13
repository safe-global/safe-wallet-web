import SettingsChangeTxInfo from '@/components/transactions/TxDetails/TxData/SettingsChange'
import type { SpendingLimitMethods } from '@/utils/transaction-guards'
import {
  isCancellationTxInfo,
  isCustomTxInfo,
  isMultiSendTxInfo,
  isMultisigDetailedExecutionInfo,
  isSettingsChangeTxInfo,
  isSpendingLimitMethod,
  isSupportedMultiSendAddress,
  isSupportedSpendingLimitAddress,
  isTransferTxInfo,
} from '@/utils/transaction-guards'
import { SpendingLimits } from '@/components/transactions/TxDetails/TxData/SpendingLimits'
import type { TransactionDetails } from '@safe-global/safe-gateway-typescript-sdk'
import { type ReactElement } from 'react'
import RejectionTxInfo from '@/components/transactions/TxDetails/TxData/Rejection'
import DecodedData from '@/components/transactions/TxDetails/TxData/DecodedData'
import TransferTxInfo from '@/components/transactions/TxDetails/TxData/Transfer'
import useChainId from '@/hooks/useChainId'
import { MultiSendTxInfo } from '@/components/transactions/TxDetails/TxData/MultiSendTxInfo'

const TxData = ({ txDetails }: { txDetails: TransactionDetails }): ReactElement => {
  const chainId = useChainId()
  const txInfo = txDetails.txInfo

  if (isTransferTxInfo(txInfo)) {
    return <TransferTxInfo txInfo={txInfo} txStatus={txDetails.txStatus} />
  }

  if (isSettingsChangeTxInfo(txInfo)) {
    return <SettingsChangeTxInfo settingsInfo={txInfo.settingsInfo} />
  }

  if (isCancellationTxInfo(txInfo) && isMultisigDetailedExecutionInfo(txDetails.detailedExecutionInfo)) {
    return <RejectionTxInfo nonce={txDetails.detailedExecutionInfo?.nonce} isTxExecuted={!!txDetails.executedAt} />
  }

  if (isSupportedMultiSendAddress(txInfo, chainId) && isMultiSendTxInfo(txInfo)) {
    return <MultiSendTxInfo txInfo={txInfo} />
  }

  const method = txDetails.txData?.dataDecoded?.method as SpendingLimitMethods
  if (isCustomTxInfo(txInfo) && isSupportedSpendingLimitAddress(txInfo, chainId) && isSpendingLimitMethod(method)) {
    return <SpendingLimits txData={txDetails.txData} txInfo={txInfo} type={method} />
  }

  return <DecodedData txData={txDetails.txData} txInfo={txInfo} />
}

export default TxData
