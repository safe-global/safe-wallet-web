import { IconButton, Tooltip } from '@mui/material'
import { useState } from 'react'
import { SubmitOwnerTxStep } from './SubmitOwnerTxStep'
import { ChooseOwnerStep, ReplaceOwnerData } from './ChooseOwnerStep'
import ChangeCircleOutlinedIcon from '@mui/icons-material/ChangeCircleOutlined'

import TxModal from '@/components/tx/TxModal'
import { TxStepperProps } from '@/components/tx/TxStepper'

export const ReplaceOwnerDialog = ({ address }: { address: string }) => {
  const [open, setOpen] = useState(false)

  const handleClose = () => setOpen(false)

  const ReplaceOwnerSteps: TxStepperProps['steps'] = [
    {
      label: 'Choose new owner',
      render: (data, onSubmit) => <ChooseOwnerStep data={data as ReplaceOwnerData} onOwnerChosen={onSubmit} />,
    },
    {
      label: 'Submit',
      render: (data) => <SubmitOwnerTxStep data={data as ReplaceOwnerData} />,
    },
  ]
  return (
    <div>
      <Tooltip title="Replace owner">
        <IconButton onClick={() => setOpen(true)}>
          <ChangeCircleOutlinedIcon />
        </IconButton>
      </Tooltip>
      {open && (
        <TxModal
          onClose={handleClose}
          steps={ReplaceOwnerSteps}
          initialData={[{ removedOwner: { address }, newOwner: { address: '', name: '' } }, undefined]}
        />
      )}
    </div>
  )
}
