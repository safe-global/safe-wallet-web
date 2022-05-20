import React from 'react'

import TxModal, { TxModalProps } from '@/components/tx/TxModal'
import { TransactionSummary } from '@gnosis.pm/safe-react-gateway-sdk'
import ExecuteProposedTx from '@/components/tx/steps/ExecuteProposedTx'
import { TxStepperProps } from '@/components/tx/TxStepper/useTxStepper'

export const ExecuteTxSteps: TxStepperProps['steps'] = [
  {
    label: 'Execute transaction',
    render: (data) => <ExecuteProposedTx txSummary={data as TransactionSummary} />,
  },
]

const ExecuteTxModal = (props: Omit<TxModalProps, 'steps'>) => {
  return <TxModal {...props} steps={ExecuteTxSteps} />
}

export default ExecuteTxModal
