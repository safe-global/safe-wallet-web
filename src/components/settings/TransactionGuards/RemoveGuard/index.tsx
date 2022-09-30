import { useState } from 'react'
import { IconButton, SvgIcon } from '@mui/material'
import DeleteIcon from '@/public/images/common/delete.svg'

import TxModal from '@/components/tx/TxModal'
import { ReviewRemoveGuard } from '@/components/settings/TransactionGuards/RemoveGuard/steps/ReviewRemoveGuard'
import type { TxStepperProps } from '@/components/tx/TxStepper/useTxStepper'

export type RemoveGuardData = {
  address: string
}

const RemoveGuardSteps: TxStepperProps['steps'] = [
  {
    label: 'Remove transaction guard',
    render: (data, onSubmit) => <ReviewRemoveGuard data={data as RemoveGuardData} onSubmit={onSubmit} />,
  },
]

export const RemoveGuard = ({ address }: { address: string }) => {
  const [open, setOpen] = useState(false)

  const initialData: RemoveGuardData = {
    address,
  }

  return (
    <>
      <IconButton onClick={() => setOpen(true)} color="error" size="small">
        <SvgIcon component={DeleteIcon} inheritViewBox color="error" fontSize="small" />
      </IconButton>
      {open && <TxModal onClose={() => setOpen(false)} steps={RemoveGuardSteps} initialData={[initialData]} />}
    </>
  )
}
