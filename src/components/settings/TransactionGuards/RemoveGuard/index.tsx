import { useState } from 'react'
import { IconButton, SvgIcon } from '@mui/material'
import DeleteIcon from '@/public/images/common/delete.svg'

import TxModal from '@/components/tx/TxModal'
import { ReviewRemoveGuard } from '@/components/settings/TransactionGuards/RemoveGuard/steps/ReviewRemoveGuard'
import type { TxStepperProps } from '@/components/tx/TxStepper/useTxStepper'
import CheckWallet from '@/components/common/CheckWallet'

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
      <CheckWallet>
        {(isOk) => (
          <IconButton onClick={() => setOpen(true)} color="error" size="small" disabled={!isOk}>
            <SvgIcon component={DeleteIcon} inheritViewBox color="error" fontSize="small" />
          </IconButton>
        )}
      </CheckWallet>

      {open && <TxModal onClose={() => setOpen(false)} steps={RemoveGuardSteps} initialData={[initialData]} />}
    </>
  )
}
