import React from 'react'
import type { TransactionSummary } from '@gnosis.pm/safe-react-gateway-sdk'

import type { TxStepperProps } from '@/components/tx/TxStepper/useTxStepper'
import type { TxModalProps } from '@/components/tx/TxModal'
import TxModal from '@/components/tx/TxModal'
import RejectTx from '@/components/tx/modals/RejectTxModal/RejectTx'

export const RejectTxSteps: TxStepperProps['steps'] = [
  {
    label: 'Reject transaction',
    render: (data, onSubmit) => <RejectTx txSummary={data as TransactionSummary} onSubmit={onSubmit} />,
  },
]

const RejectTxModal = (props: Omit<TxModalProps, 'steps'>) => {
  return <TxModal {...props} steps={RejectTxSteps} />
}

export default RejectTxModal
