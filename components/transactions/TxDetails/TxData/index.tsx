import SettingsChangeTxInfo from '@/components/transactions/TxDetails/TxData/SettingsChange'
import {
  isCancellationTxInfo,
  isCustomTxInfo,
  isMultiSendTxInfo,
  isMultisigExecutionDetails,
  isSettingsChangeTxInfo,
  isSpendingLimitMethod,
  isSupportedMultiSendAddress,
  isSupportedSpendingLimitAddress,
  isTransferTxInfo,
  SpendingLimitMethods,
} from '@/utils/transaction-guards'
import { Multisend } from '@/components/transactions/TxDetails/TxData/DecodedData/Multisend'
import { SpendingLimits } from '@/components/transactions/TxDetails/TxData/SpendingLimits'
import { TransactionDetails } from '@gnosis.pm/safe-react-gateway-sdk'
import { type ReactElement } from 'react'
import css from '../styles.module.css'
import RejectionTxInfo from '@/components/transactions/TxDetails/TxData/Rejection'
import DecodedData from '@/components/transactions/TxDetails/TxData/DecodedData'
import TransferTxInfo from '@/components/transactions/TxDetails/TxData/Transfer'
import useChainId from '@/hooks/useChainId'

const TxData = ({ txDetails }: { txDetails: TransactionDetails }): ReactElement => {
  const chainId = useChainId()
  const txInfo = txDetails.txInfo

  if (isTransferTxInfo(txInfo)) {
    return <TransferTxInfo txInfo={txInfo} txStatus={txDetails.txStatus} />
  }

  if (isSettingsChangeTxInfo(txInfo)) {
    return <SettingsChangeTxInfo settingsInfo={txInfo.settingsInfo} />
  }

  if (isCancellationTxInfo(txInfo) && isMultisigExecutionDetails(txDetails.detailedExecutionInfo)) {
    return <RejectionTxInfo nonce={txDetails.detailedExecutionInfo?.nonce} isTxExecuted={!!txDetails.executedAt} />
  }

  if (isSupportedMultiSendAddress(txInfo, chainId) && isMultiSendTxInfo(txInfo)) {
    return <Multisend txData={txDetails.txData} />
  }

  const method = txDetails.txData?.dataDecoded?.method as SpendingLimitMethods
  if (isCustomTxInfo(txInfo) && isSupportedSpendingLimitAddress(txInfo, chainId) && isSpendingLimitMethod(method)) {
    return <SpendingLimits txData={txDetails.txData} txInfo={txInfo} type={method} />
  }

  return (
    <div className={css.fallbackData}>
      <DecodedData txData={txDetails.txData} txInfo={txInfo} />
    </div>
  )
}

export default TxData
