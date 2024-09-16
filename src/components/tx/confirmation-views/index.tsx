import { type TransactionDetails } from '@safe-global/safe-gateway-typescript-sdk'
import DecodedTx from '../DecodedTx'
import ConfirmationOrder from '../ConfirmationOrder'
import useDecodeTx from '@/hooks/useDecodeTx'
import type { SafeTransaction } from '@safe-global/safe-core-sdk-types'
import { isCustomTxInfo, isGenericConfirmation } from '@/utils/transaction-guards'
import { getConfirmationViewComponent } from './utils'
import { useMemo } from 'react'

type ConfirmationViewProps = {
  txDetails: TransactionDetails
  safeTx?: SafeTransaction
  txId?: string
  isBatch?: boolean
  isApproval?: boolean
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
      {ConfirmationViewComponent}

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
