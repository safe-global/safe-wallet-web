import { isSettingsChangeTxInfo } from '@/utils/transaction-guards'
import SettingsChange from './SettingsChange'
import { TransactionInfoType, type TransactionDetails } from '@safe-global/safe-gateway-typescript-sdk'
import DecodedTx from '../DecodedTx'
import ConfirmationOrder from '../ConfirmationOrder'
import useDecodeTx from '@/hooks/useDecodeTx'
import type { SafeTransaction } from '@safe-global/safe-core-sdk-types'

type ConfirmationViewProps = {
  txDetails: TransactionDetails
  safeTx?: SafeTransaction
}

const NarrowViews: Record<any, any> = {
  [TransactionInfoType.SETTINGS_CHANGE]: SettingsChange,
}

const ConfirmationView = (props: ConfirmationViewProps) => {
  const { txInfo } = props.txDetails
  const [decodedData] = useDecodeTx(props.safeTx)

  const Component = NarrowViews[txInfo.type]

  return (
    <>
      {!!Component && <Component txDetails={props.txDetails} txInfo={txInfo} />}

      {decodedData && <ConfirmationOrder decodedData={decodedData} toAddress={props.safeTx?.data.to ?? ''} />}

      <DecodedTx
        tx={props.safeTx}
        txDetails={props.txDetails}
        decodedData={decodedData}
        showMultisend
        showMethodCall={!Component}
      />
    </>
  )
}

export default ConfirmationView
