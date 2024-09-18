import { TransactionInfoType, type TransactionDetails } from '@safe-global/safe-gateway-typescript-sdk'
import DecodedTx from '../DecodedTx'
import ConfirmationOrder from '../ConfirmationOrder'
import useDecodeTx from '@/hooks/useDecodeTx'
import type { SafeTransaction } from '@safe-global/safe-core-sdk-types'
import { isCustomTxInfo, isGenericConfirmation } from '@/utils/transaction-guards'
import { useMemo } from 'react'
import TxData from '@/components/transactions/TxDetails/TxData'
import type { NarrowConfirmationViewProps } from './types'
import SettingsChange from './SettingsChange'

type ConfirmationViewProps = {
  txDetails?: TransactionDetails
  safeTx?: SafeTransaction
  txId?: string
  isBatch?: boolean
  isApproval?: boolean
  isCreation?: boolean
  showMethodCall?: boolean
}

const getConfirmationViewComponent = (txType: TransactionInfoType, props: NarrowConfirmationViewProps) => {
  if (txType === TransactionInfoType.SETTINGS_CHANGE)
    return <SettingsChange txDetails={props.txDetails} txInfo={props.txInfo as SettingsChange} />

  return null
}

const ConfirmationView = (props: ConfirmationViewProps) => {
  const { txId } = props.txDetails || {}
  const [decodedData] = useDecodeTx(props.safeTx)

  const ConfirmationViewComponent = useMemo(
    () =>
      props.txDetails
        ? getConfirmationViewComponent(props.txDetails.txInfo.type, {
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
