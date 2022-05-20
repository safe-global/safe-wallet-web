import React from 'react'

import { TxStepperProps } from '@/components/tx/TxStepper'
import TxModal, { TxModalProps } from '@/components/tx/TxModal'
import SignProposedTx from '@/components/tx/steps/SignProposedTx'
import { TransactionSummary } from '@gnosis.pm/safe-react-gateway-sdk'

export const SignTxSteps: TxStepperProps['steps'] = [
  {
    label: 'Sign transaction',
    render: (data) => <SignProposedTx txSummary={data as TransactionSummary} />,
  },
]

const SignTxModal = (props: Omit<TxModalProps, 'steps'>) => {
  return <TxModal {...props} steps={SignTxSteps} />
}

export default SignTxModal
