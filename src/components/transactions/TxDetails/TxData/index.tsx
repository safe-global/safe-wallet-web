import SettingsChangeTxInfo from '@/components/transactions/TxDetails/TxData/SettingsChange'
import type { SpendingLimitMethods } from '@/utils/transaction-guards'
import { isStakingTxWithdrawInfo } from '@/utils/transaction-guards'
import { isStakingTxExitInfo } from '@/utils/transaction-guards'
import {
  isCancellationTxInfo,
  isCustomTxInfo,
  isMultisigDetailedExecutionInfo,
  isOrderTxInfo,
  isSettingsChangeTxInfo,
  isSpendingLimitMethod,
  isStakingTxDepositInfo,
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
import SwapOrder from '@/features/swap/components/SwapOrder'
import StakingTxDepositDetails from '@/features/stake/components/StakingTxDepositDetails'
import StakingTxExitDetails from '@/features/stake/components/StakingTxExitDetails'
import StakingTxWithdrawDetails from '@/features/stake/components/StakingTxWithdrawDetails'

const TxData = ({
  txDetails,
  trusted,
  imitation,
}: {
  txDetails: TransactionDetails
  trusted: boolean
  imitation: boolean
}): ReactElement => {
  const chainId = useChainId()
  const txInfo = txDetails.txInfo
  const toInfo = isCustomTxInfo(txDetails.txInfo) ? txDetails.txInfo.to : undefined

  if (isOrderTxInfo(txDetails.txInfo)) {
    return <SwapOrder txData={txDetails.txData} txInfo={txDetails.txInfo} />
  }

  if (isStakingTxDepositInfo(txDetails.txInfo)) {
    return <StakingTxDepositDetails txData={txDetails.txData} info={txDetails.txInfo} />
  }

  if (isStakingTxExitInfo(txDetails.txInfo)) {
    return <StakingTxExitDetails info={txDetails.txInfo} />
  }

  if (isStakingTxWithdrawInfo(txDetails.txInfo)) {
    return <StakingTxWithdrawDetails info={txDetails.txInfo} />
  }

  if (isTransferTxInfo(txInfo)) {
    return <TransferTxInfo txInfo={txInfo} txStatus={txDetails.txStatus} trusted={trusted} imitation={imitation} />
  }

  if (isSettingsChangeTxInfo(txInfo)) {
    return <SettingsChangeTxInfo settingsInfo={txInfo.settingsInfo} />
  }

  if (isCancellationTxInfo(txInfo) && isMultisigDetailedExecutionInfo(txDetails.detailedExecutionInfo)) {
    return <RejectionTxInfo nonce={txDetails.detailedExecutionInfo?.nonce} isTxExecuted={!!txDetails.executedAt} />
  }

  const method = txDetails.txData?.dataDecoded?.method as SpendingLimitMethods
  if (isCustomTxInfo(txInfo) && isSupportedSpendingLimitAddress(txInfo, chainId) && isSpendingLimitMethod(method)) {
    return <SpendingLimits txData={txDetails.txData} txInfo={txInfo} type={method} />
  }

  return <DecodedData txData={txDetails.txData} toInfo={toInfo} />
}

export default TxData
