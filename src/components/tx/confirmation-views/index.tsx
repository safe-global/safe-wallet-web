import { type TransactionDetails } from '@safe-global/safe-gateway-typescript-sdk'
import DecodedTx from '../DecodedTx'
import ConfirmationOrder from '../ConfirmationOrder'
import useDecodeTx from '@/hooks/useDecodeTx'
import type { SafeTransaction } from '@safe-global/safe-core-sdk-types'
import {
  isAnyStakingTxInfo,
  isCustomTxInfo,
  isExecTxData,
  isGenericConfirmation,
  isOnChainConfirmationTxData,
  isOrderTxInfo,
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
}: NarrowConfirmationViewProps & { txFlow?: JSX.Element }) => {
  if (isChangeThresholdView(txInfo)) return <ChangeThreshold />

  if (isConfirmBatchView(txFlow)) return <BatchTransactions />

  if (isSettingsChangeView(txInfo)) return <SettingsChange txDetails={txDetails} txInfo={txInfo as SettingsChange} />

  if (isOnChainConfirmationTxData(txDetails.txData))
    return <OnChainConfirmation data={txDetails.txData} isConfirmationView />

  if (isExecTxData(txDetails.txData)) return <ExecTransaction data={txDetails.txData} isConfirmationView />

  return null
}

const ConfirmationView = ({ txDetails, ...props }: ConfirmationViewProps) => {
  const { txId } = txDetails || {}
  const [decodedData] = useDecodeTx(props.safeTx)
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

      {decodedData && <ConfirmationOrder decodedData={decodedData} toAddress={props.safeTx?.data.to ?? ''} />}

      {props.children}

      <DecodedTx
        tx={props.safeTx}
        txDetails={txDetails}
        decodedData={decodedData}
        showMultisend={!props.isBatch}
        showMethodCall={
          props.showMethodCall &&
          !ConfirmationViewComponent &&
          !showTxDetails &&
          !props.isApproval &&
          isGenericConfirmation(decodedData)
        }
      />
    </>
  )
}

export default ConfirmationView
