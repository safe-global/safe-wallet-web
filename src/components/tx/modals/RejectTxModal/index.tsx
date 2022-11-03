import React from 'react'

import type { TxStepperProps } from '@/components/tx/TxStepper/useTxStepper'
import type { TxModalProps } from '@/components/tx/TxModal'
import TxModal from '@/components/tx/TxModal'
import RejectTx from '@/components/tx/modals/RejectTxModal/RejectTx'

export const RejectTxSteps: TxStepperProps['steps'] = [
  {
    label: 'Reject transaction',
    render: (data, onSubmit) => <RejectTx txNonce={data as number} onSubmit={onSubmit} />,
  },
]

const RejectTxModal = (props: Omit<TxModalProps, 'steps'>) => {
  return <TxModal {...props} steps={RejectTxSteps} />
}

export default RejectTxModal
