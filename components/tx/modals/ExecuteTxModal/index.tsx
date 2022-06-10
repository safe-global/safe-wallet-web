import React from 'react'

import { TxStepperProps } from '@/components/tx/TxStepper'
import TxModal, { TxModalProps } from '@/components/tx/TxModal'
import { TransactionSummary } from '@gnosis.pm/safe-react-gateway-sdk'
import ExecuteProposedTx from '@/components/tx/steps/ExecuteProposedTx'

export const ExecuteTxSteps: TxStepperProps['steps'] = [
  {
    label: 'Execute transaction',
    render: (data, onSubmit) => <ExecuteProposedTx txSummary={data as TransactionSummary} onSubmit={onSubmit} />,
  },
]

const ExecuteTxModal = (props: Omit<TxModalProps, 'steps'>) => {
  return <TxModal {...props} steps={ExecuteTxSteps} />
}

export default ExecuteTxModal
