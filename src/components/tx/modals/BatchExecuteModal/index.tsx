import React from 'react'

import type { TxModalProps } from '@/components/tx/TxModal'
import TxModal from '@/components/tx/TxModal'
import type { Transaction } from '@safe-global/safe-gateway-typescript-sdk'
import type { TxStepperProps } from '@/components/tx/TxStepper/useTxStepper'
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
