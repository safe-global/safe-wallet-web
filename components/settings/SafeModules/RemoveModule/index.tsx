import { TxStepperProps } from '@/components/tx/TxStepper/useTxStepper'
import { useState } from 'react'
import { IconButton } from '@mui/material'
import TxModal from '@/components/tx/TxModal'
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline'
import { ReviewRemoveModule } from '@/components/settings/SafeModules/RemoveModule/steps/ReviewRemoveModule'

export type RemoveModuleData = {
  address: string
}

const RemoveModuleSteps: TxStepperProps['steps'] = [
  {
    label: 'Remove Module',
    render: (data, onSubmit) => <ReviewRemoveModule data={data as RemoveModuleData} onSubmit={onSubmit} />,
  },
]

export const RemoveModule = ({ address }: { address: string }) => {
  const [open, setOpen] = useState(false)

  const initialData = {
    address,
  }

  return (
    <>
      <IconButton onClick={() => setOpen(true)} size="small">
        <DeleteOutlineIcon color="error" fontSize="small" />
      </IconButton>
      {open && <TxModal onClose={() => setOpen(false)} steps={RemoveModuleSteps} initialData={[initialData]} />}
    </>
  )
}
