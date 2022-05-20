import React from 'react'
import { TransactionSummary } from '@gnosis.pm/safe-react-gateway-sdk'

import { TxStepperProps } from '@/components/tx/TxStepper'
import TxModal, { TxModalProps } from '@/components/tx/TxModal'
import RejectTx from '@/components/tx/steps/RejectTx'

export const RejectTxSteps: TxStepperProps['steps'] = [
  {
    label: 'Reject transaction',
    render: (data) => <RejectTx txSummary={data as TransactionSummary} />,
  },
]

const RejectTxModal = (props: Omit<TxModalProps, 'steps'>) => {
  return <TxModal {...props} steps={RejectTxSteps} />
}

export default RejectTxModal
