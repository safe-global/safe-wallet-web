import React from 'react'

import type { TxModalProps } from '@/components/tx/TxModal'
import TxModal from '@/components/tx/TxModal'
import type { TransactionSummary } from '@safe-global/safe-gateway-typescript-sdk'
import type { TxStepperProps } from '@/components/tx/TxStepper/useTxStepper'
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
