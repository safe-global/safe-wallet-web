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
  txDetails: TransactionDetails
  safeTx?: SafeTransaction
  txId?: string
  isBatch?: boolean
  isApproval?: boolean
}

const getConfirmationViewComponent = (txType: TransactionInfoType, props: NarrowConfirmationViewProps) => {
  if (txType === TransactionInfoType.SETTINGS_CHANGE)
    return <SettingsChange txDetails={props.txDetails} txInfo={props.txInfo as SettingsChange} />

  return null
}

const ConfirmationView = (props: ConfirmationViewProps) => {
  const { txInfo, txId } = props.txDetails
  const [decodedData] = useDecodeTx(props.safeTx)

  const ConfirmationViewComponent = useMemo(
    () =>
      getConfirmationViewComponent(txInfo.type, {
        txDetails: props.txDetails,
        txInfo,
      }),
    [props.txDetails, txInfo],
  )
  const showTxDetails = txId && props.txDetails && !isCustomTxInfo(props.txDetails.txInfo)

  return (
    <>
      {ConfirmationViewComponent || (showTxDetails && <TxData txDetails={props.txDetails} imitation={false} trusted />)}

      {decodedData && <ConfirmationOrder decodedData={decodedData} toAddress={props.safeTx?.data.to ?? ''} />}

      <DecodedTx
        tx={props.safeTx}
        txDetails={props.txDetails}
        decodedData={decodedData}
        showMultisend={!props.isBatch}
        showMethodCall={
          !ConfirmationViewComponent && !showTxDetails && !props.isApproval && isGenericConfirmation(decodedData)
        }
      />
    </>
  )
}

export default ConfirmationView
