import type { ReactElement } from 'react'
import TxStepper from '../TxStepper'
import type { TxStepperProps } from '@/components/tx/TxStepper/useTxStepper'
import ModalDialog from '@/components/common/ModalDialog'

export type TxModalProps = {
  onClose: () => void
  steps: TxStepperProps['steps']
  wide?: boolean
  initialData?: TxStepperProps['initialData']
}

const TxModal = ({ onClose, steps, wide = false, initialData }: TxModalProps): ReactElement => {
  return (
    <ModalDialog open onClose={onClose} maxWidth={wide ? 'md' : 'sm'} fullWidth>
      <TxStepper steps={steps} initialData={initialData} onClose={onClose} />
    </ModalDialog>
  )
}

export default TxModal
