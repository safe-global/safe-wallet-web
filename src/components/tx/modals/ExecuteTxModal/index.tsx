import React from 'react'

import TxModal, { TxModalProps } from '@/components/tx/TxModal'
import { TransactionSummary } from '@gnosis.pm/safe-react-gateway-sdk'
import { TxStepperProps } from '@/components/tx/TxStepper/useTxStepper'
import ConfirmProposedTx from '@/components/tx/modals/ConfirmTxModal/ConfirmProposedTx'

export const ExecuteTxSteps: TxStepperProps['steps'] = [
  {
    label: 'Execute transaction',
    render: (data, onSubmit) => <ConfirmProposedTx txSummary={data as TransactionSummary} onSubmit={onSubmit} />,
  },
]

const ExecuteTxModal = (props: Omit<TxModalProps, 'steps'>) => {
  return <TxModal {...props} steps={ExecuteTxSteps} />
}

export default ExecuteTxModal
