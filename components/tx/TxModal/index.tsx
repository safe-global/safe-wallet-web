import React from 'react'
import Box from '@mui/material/Box'
import Modal from '@mui/material/Modal'

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
      <Box className={`${css.modal} ${wide ? css.wide : css.narrow}`} onClick={onClick}>
        <TxStepper steps={steps} initialData={initialData} onClose={onClose} />
      </Box>
    </Modal>
  )
}

export default TxModal
