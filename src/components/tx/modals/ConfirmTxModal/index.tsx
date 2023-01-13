import React from 'react'

import type { TxStepperProps } from '@/components/tx/TxStepper/useTxStepper'
import type { TxModalProps } from '@/components/tx/TxModal'
import TxModal from '@/components/tx/TxModal'
import ConfirmProposedTx from '@/components/tx/modals/ConfirmTxModal/ConfirmProposedTx'
import type { TransactionSummary } from '@safe-global/safe-gateway-typescript-sdk'

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
