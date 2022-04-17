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
  bgcolor: 'background.paper',
  boxShadow: 24,
  p: 4,
}

const tokenTransferSteps: TxStepperProps['steps'] = [
  {
    label: 'Create transaction',
    render: (onSubmit) => <SendAssetsForm onSubmit={onSubmit} />,
  },
  {
    label: 'Review',
    render: (onSubmit, data) => <ReviewTx params={data as SendAssetsFormData} onSubmit={onSubmit} />,
  },
  {
    label: 'Sign',
    render: (onSubmit, data) => <SignTx tx={data as SafeTransaction} onSubmit={onSubmit} />,
  },
  {
    label: 'Done',
    render: (_, data) => <FinishTx tx={data as SafeTransaction} />,
  },
]

const signTxSteps: TxStepperProps['steps'] = [
  {
    label: 'Sign transaction',
    render: (onSubmit, data) => <SignProposedTx txSummary={data as TransactionSummary} onSubmit={onSubmit} />,
  },
  {
    label: 'Done',
    render: (_, data) => <FinishTx tx={data as SafeTransaction} />,
  },
]

type TxModalProps = {
  onClose: () => void
  txSummary?: TransactionSummary
}

const TxModal = ({ onClose, txSummary }: TxModalProps) => {
  const steps = txSummary ? signTxSteps : tokenTransferSteps

  return (
    <Modal open onClose={onClose} aria-labelledby="modal-title" aria-describedby="modal-description">
      <Box sx={style}>
        <TxStepper steps={steps} initialStepData={[txSummary]} />
      </Box>
    </Modal>
  )
}

export default TxModal
