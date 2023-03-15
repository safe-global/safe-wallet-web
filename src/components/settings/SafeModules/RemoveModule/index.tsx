import type { TxStepperProps } from '@/components/tx/TxStepper/useTxStepper'
import { useState } from 'react'
import { IconButton, SvgIcon } from '@mui/material'
import TxModal from '@/components/tx/TxModal'
import DeleteIcon from '@/public/images/common/delete.svg'
import { ReviewRemoveModule } from '@/components/settings/SafeModules/RemoveModule/steps/ReviewRemoveModule'
import CheckWallet from '@/components/common/CheckWallet'

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
      <CheckWallet>
        {(isOk) => (
          <IconButton onClick={() => setOpen(true)} color="error" size="small" disabled={!isOk}>
            <SvgIcon component={DeleteIcon} inheritViewBox color="error" fontSize="small" />
          </IconButton>
        )}
      </CheckWallet>

      {open && <TxModal onClose={() => setOpen(false)} steps={RemoveModuleSteps} initialData={[initialData]} />}
    </>
  )
}
