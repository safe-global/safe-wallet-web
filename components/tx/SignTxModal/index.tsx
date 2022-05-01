import React from 'react'

import { TxStepperProps } from '@/components/tx/TxStepper'
import TxModal from '@/components/tx/TxModal'
import SignProposedTx from '@/components/tx/SignProposedTx'
import { TransactionSummary } from '@gnosis.pm/safe-react-gateway-sdk'

export const SignTxSteps: TxStepperProps['steps'] = [
  {
    label: 'Sign transaction',
    render: (data) => <SignProposedTx txSummary={data as TransactionSummary} />,
  },
]

const SignTxModal = ({ onClose, initialData }: { onClose: () => void; initialData: TxStepperProps['initialData'] }) => {
  return <TxModal onClose={onClose} steps={SignTxSteps} initialData={initialData} />
}

export default SignTxModal
