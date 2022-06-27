import React from 'react'
import { Paper, Modal, Box } from '@mui/material'

import TxStepper from '../TxStepper'
import css from './styles.module.css'
import { TxStepperProps } from '@/components/tx/TxStepper/useTxStepper'

export type TxModalProps = {
  onClose: () => void
  steps: TxStepperProps['steps']
  wide?: boolean
  initialData?: TxStepperProps['initialData']
}

const TxModal = ({ onClose, steps, wide = false, initialData }: TxModalProps) => {
  const onClick = (e: React.MouseEvent) => e.stopPropagation()

  return (
    <Modal open onClose={onClose} aria-labelledby="modal-title" aria-describedby="modal-description">
      <Paper className={`${css.modal} ${wide ? css.wide : css.narrow}`} onClick={onClick} elevation={2}>
        <Box padding={2}>
          <TxStepper steps={steps} initialData={initialData} onClose={onClose} />
        </Box>
      </Paper>
    </Modal>
  )
}

export default TxModal
