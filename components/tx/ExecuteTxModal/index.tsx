import React from 'react'

import { TxStepperProps } from '@/components/tx/TxStepper'
import TxModal from '@/components/tx/TxModal'
import SignProposedTx from '@/components/tx/SignProposedTx'
import { TransactionSummary } from '@gnosis.pm/safe-react-gateway-sdk'
import ExecuteProposedTx from '@/components/tx/ExecuteProposedTx'

export const ExecuteTxSteps: TxStepperProps['steps'] = [
  {
    label: 'Execute transaction',
    render: (data) => <ExecuteProposedTx txSummary={data as TransactionSummary} />,
  },
]

const ExecuteTxModal = ({
  onClose,
  initialData,
}: {
  onClose: () => void
  initialData: TxStepperProps['initialData']
}) => {
  return <TxModal onClose={onClose} steps={ExecuteTxSteps} initialData={initialData} />
}

export default ExecuteTxModal
