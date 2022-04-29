import React from 'react'
import { type TransactionSummary } from '@gnosis.pm/safe-react-gateway-sdk'
import { type SafeTransaction } from '@gnosis.pm/safe-core-sdk-types'
import Box from '@mui/material/Box'
import Modal from '@mui/material/Modal'

import TxStepper, { TxStepperProps } from '../TxStepper'
import SendAssetsForm, { SendAssetsFormData } from '../SendAssetsForm'
import ReviewTx from '../ReviewTx'
import SignTx from '../SignTx'
import FinishTx from '../FinishTx'
import SignProposedTx from '../SignProposedTx'

const style = {
  position: 'absolute' as 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 600,
  maxWidth: '100vw',
  maxHeight: '90vh',
  bgcolor: 'background.paper',
  boxShadow: 24,
  p: 4,
}

export const tokenTransferSteps: TxStepperProps['steps'] = [
  {
    label: 'Create transaction',
    render: (data, onSubmit) => <SendAssetsForm onSubmit={onSubmit} formData={data as SendAssetsFormData} />,
  },
  {
    label: 'Review',
    render: (data, onSubmit) => <ReviewTx params={data as SendAssetsFormData} onSubmit={onSubmit} />,
  },
  {
    label: 'Sign',
    render: (data, onSubmit) => <SignTx tx={data as SafeTransaction} onSubmit={onSubmit} />,
  },
  {
    label: 'Done',
    render: (data) => <FinishTx tx={data as SafeTransaction} />,
  },
]

type TxModalProps = {
  onClose: () => void
  steps: TxStepperProps['steps']
  initialData?: TxStepperProps['initialData']
}

const TxModal = ({ onClose, steps, initialData }: TxModalProps) => {
  const onClick = (e: React.MouseEvent) => e.stopPropagation()

  return (
    <Modal open onClose={onClose} aria-labelledby="modal-title" aria-describedby="modal-description">
      <Box sx={style} onClick={onClick}>
        <TxStepper steps={steps} initialData={initialData} />
      </Box>
    </Modal>
  )
}

export default TxModal
