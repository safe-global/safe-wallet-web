import React from 'react'

import { TxStepperProps } from '@/components/tx/TxStepper'
import TxModal, { TxModalProps } from '@/components/tx/TxModal'
import SignProposedTx from '@/components/tx/SignProposedTx'
import { TransactionSummary } from '@gnosis.pm/safe-react-gateway-sdk'
import ExecuteProposedTx from '@/components/tx/ExecuteProposedTx'

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
