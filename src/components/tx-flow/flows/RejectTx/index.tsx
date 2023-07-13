import type { ReactElement } from 'react'
import TxLayout from '../../common/TxLayout'
import RejectTx from './RejectTx'

type RejectTxProps = {
  txNonce: number
}

const RejectTxFlow = ({ txNonce }: RejectTxProps): ReactElement => {
  return (
    <TxLayout title="Confirm transaction" subtitle="Reject" step={0}>
      <RejectTx txNonce={txNonce} />
    </TxLayout>
  )
}

export default RejectTxFlow
