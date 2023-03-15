import { Button, SvgIcon } from '@mui/material'
import { useState } from 'react'
import AddIcon from '@/public/images/common/add.svg'
import { ChooseOwnerStep } from './DialogSteps/ChooseOwnerStep'

import TxModal from '@/components/tx/TxModal'
import useSafeInfo from '@/hooks/useSafeInfo'
import { ReviewOwnerTxStep } from '@/components/settings/owner/AddOwnerDialog/DialogSteps/ReviewOwnerTxStep'
import type { ChangeOwnerData } from '@/components/settings/owner/AddOwnerDialog/DialogSteps/types'
import { SetThresholdStep } from '@/components/settings/owner/AddOwnerDialog/DialogSteps/SetThresholdStep'
import type { TxStepperProps } from '@/components/tx/TxStepper/useTxStepper'
import Box from '@mui/material/Box'
import Track from '@/components/common/Track'
import { SETTINGS_EVENTS } from '@/services/analytics/events/settings'
import CheckWallet from '@/components/common/CheckWallet'

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

export const AddOwnerDialog = () => {
  const [open, setOpen] = useState(false)

  const { safe } = useSafeInfo()

  const handleClose = () => setOpen(false)

  const initialModalData: Partial<ChangeOwnerData> = { threshold: safe.threshold }

  return (
    <Box paddingTop={2}>
      <CheckWallet>
        {(isOk) => (
          <Track {...SETTINGS_EVENTS.SETUP.ADD_OWNER}>
            <Button
              onClick={() => setOpen(true)}
              variant="text"
              startIcon={<SvgIcon component={AddIcon} inheritViewBox fontSize="small" />}
              disabled={!isOk}
            >
              Add new owner
            </Button>
          </Track>
        )}
      </CheckWallet>

      {open && <TxModal wide onClose={handleClose} steps={AddOwnerSteps} initialData={[initialModalData]} />}
    </Box>
  )
}
