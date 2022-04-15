import Box from '@mui/material/Box'
import Modal from '@mui/material/Modal'
import TxStepper from '../TxStepper'

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

const TxModal = ({ onClose }: { onClose: () => void }) => {
  return (
    <Modal open onClose={onClose} aria-labelledby="modal-modal-title" aria-describedby="modal-modal-description">
      <Box sx={style}>
        <TxStepper />
      </Box>
    </Modal>
  )
}

export default TxModal
