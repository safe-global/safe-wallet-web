import {
  SettingsInfoType,
  TransactionInfoType,
  type TransactionDetails,
} from '@safe-global/safe-gateway-typescript-sdk'
import DecodedTx from '../DecodedTx'
import ConfirmationOrder from '../ConfirmationOrder'
import useDecodeTx from '@/hooks/useDecodeTx'
import type { SafeTransaction } from '@safe-global/safe-core-sdk-types'
import { isCustomTxInfo, isGenericConfirmation } from '@/utils/transaction-guards'
import { type ReactNode, useMemo } from 'react'
import TxData from '@/components/transactions/TxDetails/TxData'
import type { NarrowConfirmationViewProps } from './types'
import SettingsChange from './SettingsChange'
import ChangeThreshold from './ChangeThreshold'

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

const getConfirmationViewComponent = ({ txDetails, txInfo }: NarrowConfirmationViewProps) => {
  const isChangeThresholdScreen =
    txInfo.type === TransactionInfoType.SETTINGS_CHANGE &&
    txInfo.settingsInfo?.type === SettingsInfoType.CHANGE_THRESHOLD

  if (isChangeThresholdScreen) return <ChangeThreshold />

  if (txInfo.type === TransactionInfoType.SETTINGS_CHANGE)
    return <SettingsChange txDetails={txDetails} txInfo={txInfo as SettingsChange} />

  return null
}

const ConfirmationView = (props: ConfirmationViewProps) => {
  const { txId } = props.txDetails || {}
  const [decodedData] = useDecodeTx(props.safeTx)

  const ConfirmationViewComponent = useMemo(
    () =>
      props.txDetails
        ? getConfirmationViewComponent({
            txDetails: props.txDetails,
            txInfo: props.txDetails.txInfo,
          })
        : undefined,
    [props.txDetails],
  )
  const showTxDetails = txId && !props.isCreation && props.txDetails && !isCustomTxInfo(props.txDetails.txInfo)

  return (
    <>
      {ConfirmationViewComponent ||
        (showTxDetails && props.txDetails && <TxData txDetails={props.txDetails} imitation={false} trusted />)}

      {decodedData && <ConfirmationOrder decodedData={decodedData} toAddress={props.safeTx?.data.to ?? ''} />}

      {props.children}

      <DecodedTx
        tx={props.safeTx}
        txDetails={props.txDetails}
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
