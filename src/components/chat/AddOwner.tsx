import AddIcon from '@/public/images/common/add.svg'
import { IconButton, SvgIcon } from '@mui/material'
import { useState } from 'react'

import CheckWallet from '@/components/common/CheckWallet'
import Track from '@/components/common/Track'
import { ReviewOwnerTxStep } from '@/components/settings/owner/AddOwnerDialog/DialogSteps/ReviewOwnerTxStep'
import { SetThresholdStep } from '@/components/settings/owner/AddOwnerDialog/DialogSteps/SetThresholdStep'
import type { ChangeOwnerData } from '@/components/settings/owner/AddOwnerDialog/DialogSteps/types'
import TxModal from '@/components/tx/TxModal'
import type { TxStepperProps } from '@/components/tx/TxStepper/useTxStepper'
import useSafeInfo from '@/hooks/useSafeInfo'
import { SETTINGS_EVENTS } from '@/services/analytics/events/settings'
import Box from '@mui/material/Box'
import { ChooseOwnerStep } from '../settings/owner/AddOwnerDialog/DialogSteps/ChooseOwnerStep'

const AddOwnerSteps: TxStepperProps['steps'] = [
  {
    label: 'Add new owner',
    render: (data, onSubmit) => <ChooseOwnerStep data={data as ChangeOwnerData} onSubmit={onSubmit} />,
  },
  {
    label: 'Set threshold',
    render: (data, onSubmit) => <SetThresholdStep data={data as ChangeOwnerData} onSubmit={onSubmit} />,
  },
  {
    label: 'Review transaction',
    render: (data, onSubmit) => <ReviewOwnerTxStep data={data as ChangeOwnerData} onSubmit={onSubmit} />,
  },
]

export const AddOwner = () => {
  const [open, setOpen] = useState(false)

  const { safe } = useSafeInfo()

  const handleClose = () => setOpen(false)

  const initialModalData: Partial<ChangeOwnerData> = { threshold: safe.threshold }

  return (
    <Box>
      <CheckWallet>
        {(isOk) => (
          <Track {...SETTINGS_EVENTS.SETUP.ADD_OWNER}>
            <IconButton onClick={() => setOpen(true)} disabled={!isOk}>
              <SvgIcon component={AddIcon} inheritViewBox fontSize="medium" />
            </IconButton>
          </Track>
        )}
      </CheckWallet>

      {open && <TxModal wide onClose={handleClose} steps={AddOwnerSteps} initialData={[initialModalData]} />}
    </Box>
  )
}
