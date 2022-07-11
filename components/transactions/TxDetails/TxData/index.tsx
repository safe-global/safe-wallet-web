import SettingsChangeTxInfo from '@/components/transactions/TxDetails/TxData/SettingsChange'
import {
  isCancellationTxInfo,
  isMultisigExecutionDetails,
  isSettingsChangeTxInfo,
  isTransferTxInfo,
} from '@/utils/transaction-guards'
import { TransactionDetails } from '@gnosis.pm/safe-react-gateway-sdk'
import { type ReactElement } from 'react'
import RejectionTxInfo from '@/components/transactions/TxDetails/TxData/Rejection'
import DecodedData from '@/components/transactions/TxDetails/TxData/DecodedData'
import TransferTxInfo from '@/components/transactions/TxDetails/TxData/Transfer'

const TxData = ({ txDetails }: { txDetails: TransactionDetails }): ReactElement => {
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

  return <DecodedData txData={txDetails.txData} txInfo={txDetails.txInfo}></DecodedData>
}

export default TxData
