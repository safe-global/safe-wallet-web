import React from 'react'

import { TxStepperProps } from '@/components/tx/TxStepper/useTxStepper'
import TxModal, { TxModalProps } from '@/components/tx/TxModal'
import ConfirmProposedTx from '@/components/tx/steps/ConfirmProposedTx'
import { TransactionSummary } from '@gnosis.pm/safe-react-gateway-sdk'

export const ConfirmTxSteps: TxStepperProps['steps'] = [
  {
    label: 'Confirm transaction',
    render: (data, onSubmit) => <ConfirmProposedTx txSummary={data as TransactionSummary} onSubmit={onSubmit} />,
  },
]

const ConfirmTxModal = (props: Omit<TxModalProps, 'steps'>) => {
  return <TxModal {...props} steps={ConfirmTxSteps} />
}

export default ConfirmTxModal
