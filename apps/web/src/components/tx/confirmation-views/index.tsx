import { type TransactionDetails } from '@safe-global/safe-gateway-typescript-sdk'
import DecodedTx from '../DecodedTx'
import type { SafeTransaction } from '@safe-global/safe-core-sdk-types'
import {
  isAnyStakingTxInfo,
  isCustomTxInfo,
  isExecTxData,
  isOnChainConfirmationTxData,
  isOrderTxInfo,
  isSafeToL2MigrationTxData,
  isSafeUpdateTxData,
  isSwapOrderTxInfo,
} from '@/utils/transaction-guards'
import { type ReactNode, useContext, useMemo } from 'react'
import TxData from '@/components/transactions/TxDetails/TxData'
import type { NarrowConfirmationViewProps } from './types'
import SettingsChange from './SettingsChange'
import ChangeThreshold from './ChangeThreshold'
import BatchTransactions from './BatchTransactions'
import { TxModalContext } from '@/components/tx-flow'
import { isSettingsChangeView, isChangeThresholdView, isConfirmBatchView } from './utils'
import { OnChainConfirmation } from '@/components/transactions/TxDetails/TxData/NestedTransaction/OnChainConfirmation'
import { ExecTransaction } from '@/components/transactions/TxDetails/TxData/NestedTransaction/ExecTransaction'
import { type ReactElement } from 'react'
import SwapOrder from './SwapOrder'
import StakingTx from './StakingTx'
import UpdateSafe from './UpdateSafe'
import { MigrateToL2Information } from './MigrateToL2Information'

type ConfirmationViewProps = {
  txDetails?: TransactionDetails
  safeTx?: SafeTransaction
  txId?: string
  isBatch?: boolean
  isApproval?: boolean
  isCreation?: boolean
  showMethodCall?: boolean // @TODO: remove this prop when we migrate all tx types
  children?: ReactNode
}

// TODO: Maybe unify this with the if block in TxData
const getConfirmationViewComponent = ({
  txDetails,
  txInfo,
  txFlow,
}: NarrowConfirmationViewProps & { txFlow?: ReactElement }) => {
  if (isChangeThresholdView(txInfo)) return <ChangeThreshold txDetails={txDetails} />

  if (isConfirmBatchView(txFlow)) return <BatchTransactions />

  if (isSettingsChangeView(txInfo)) return <SettingsChange txDetails={txDetails} txInfo={txInfo as SettingsChange} />

  if (isOnChainConfirmationTxData(txDetails.txData))
    return <OnChainConfirmation data={txDetails.txData} isConfirmationView />

  if (isExecTxData(txDetails.txData)) return <ExecTransaction data={txDetails.txData} isConfirmationView />

  if (isSwapOrderTxInfo(txInfo)) return <SwapOrder txDetails={txDetails} txInfo={txInfo} />

  if (isAnyStakingTxInfo(txInfo)) return <StakingTx txDetails={txDetails} txInfo={txInfo} />

  if (isCustomTxInfo(txInfo) && isSafeUpdateTxData(txDetails.txData)) return <UpdateSafe />

  if (isCustomTxInfo(txInfo) && isSafeToL2MigrationTxData(txDetails.txData)) {
    return <MigrateToL2Information variant="queue" txData={txDetails.txData} />
  }

  return null
}

const ConfirmationView = ({ txDetails, ...props }: ConfirmationViewProps) => {
  const { txId } = txDetails || {}
  const { txFlow } = useContext(TxModalContext)

  const ConfirmationViewComponent = useMemo(
    () =>
      txDetails
        ? getConfirmationViewComponent({
            txDetails,
            txInfo: txDetails.txInfo,
            txFlow,
          })
        : undefined,
    [txDetails, txFlow],
  )

  const showTxDetails =
    txId &&
    !props.isCreation &&
    txDetails &&
    !isCustomTxInfo(txDetails.txInfo) &&
    !isAnyStakingTxInfo(txDetails.txInfo) &&
    !isOrderTxInfo(txDetails.txInfo)

  return (
    <>
      {ConfirmationViewComponent ||
        (showTxDetails && txDetails && <TxData txDetails={txDetails} imitation={false} trusted />)}

      {props.children}

      <DecodedTx
        tx={props.safeTx}
        txDetails={txDetails}
        decodedData={txDetails?.txData?.dataDecoded}
        showMultisend={!props.isBatch}
        showMethodCall={props.showMethodCall && !ConfirmationViewComponent && !showTxDetails && !props.isApproval}
      />
    </>
  )
}

export default ConfirmationView
