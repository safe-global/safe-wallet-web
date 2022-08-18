import React from 'react'

import TxModal, { TxModalProps } from '@/components/tx/TxModal'
import { Transaction } from '@gnosis.pm/safe-react-gateway-sdk'
import { TxStepperProps } from '@/components/tx/TxStepper/useTxStepper'
import ReviewBatchExecute from '@/components/tx/modals/BatchExecuteModal/ReviewBatchExecute'

export type BatchExecuteData = {
  txs: Transaction[]
}

const BatchExecuteSteps: TxStepperProps['steps'] = [
  {
    label: 'Execute batch',
    render: (data, onSubmit) => <ReviewBatchExecute data={data as BatchExecuteData} onSubmit={onSubmit} />,
  },
]

const BatchExecuteModal = (props: Omit<TxModalProps, 'steps'>) => {
  return <TxModal {...props} steps={BatchExecuteSteps} />
}

export default BatchExecuteModal
