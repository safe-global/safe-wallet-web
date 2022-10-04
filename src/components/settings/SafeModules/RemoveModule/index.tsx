import type { TxStepperProps } from '@/components/tx/TxStepper/useTxStepper'
import { useState } from 'react'
import { IconButton, SvgIcon } from '@mui/material'
import TxModal from '@/components/tx/TxModal'
import DeleteIcon from '@/public/images/common/delete.svg'
import { ReviewRemoveModule } from '@/components/settings/SafeModules/RemoveModule/steps/ReviewRemoveModule'

export type RemoveModuleData = {
  address: string
}

const RemoveModuleSteps: TxStepperProps['steps'] = [
  {
    label: 'Remove module',
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
      <IconButton onClick={() => setOpen(true)} color="error" size="small">
        <SvgIcon component={DeleteIcon} inheritViewBox color="error" fontSize="small" />
      </IconButton>
      {open && <TxModal onClose={() => setOpen(false)} steps={RemoveModuleSteps} initialData={[initialData]} />}
    </>
  )
}
