import { ReactElement } from 'react'
import TxStepper from '../TxStepper'
import { TxStepperProps } from '@/components/tx/TxStepper/useTxStepper'
import ModalDialog from '@/components/common/ModalDialog'

export type TxModalProps = {
  onClose: () => void
  steps: TxStepperProps['steps']
  wide?: boolean
  initialData?: TxStepperProps['initialData']
}

const TxModal = ({ onClose, steps, wide = false, initialData }: TxModalProps): ReactElement => {
  return (
    <div onClick={(e) => e.stopPropagation()}>
      <ModalDialog open onClose={onClose} maxWidth={wide ? 'md' : 'sm'} fullWidth>
        <TxStepper steps={steps} initialData={initialData} onClose={onClose} />
      </ModalDialog>
    </div>
  )
}

export default TxModal
