import { Button } from '@mui/material'
import { useState } from 'react'
import AddIcon from '@mui/icons-material/Add'
import { ChooseOwnerStep } from './DialogSteps/ChooseOwnerStep'

import TxModal from '@/components/tx/TxModal'
import useSafeInfo from '@/hooks/useSafeInfo'
import { ReviewOwnerTxStep } from '@/components/settings/owner/AddOwnerDialog/DialogSteps/ReviewOwnerTxStep'
import { ChangeOwnerData } from '@/components/settings/owner/AddOwnerDialog/DialogSteps/types'
import { SetThresholdStep } from '@/components/settings/owner/AddOwnerDialog/DialogSteps/SetThresholdStep'
import { TxStepperProps } from '@/components/tx/TxStepper/useTxStepper'
import Box from '@mui/material/Box'
import Track from '@/components/common/Track'
import { SETTINGS_EVENTS } from '@/services/analytics/events/settings'

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
      <div>
        <Track {...SETTINGS_EVENTS.SETUP.ADD_OWNER}>
          <Button onClick={() => setOpen(true)} variant="text">
            <AddIcon fontSize="small" sx={{ mr: 1 }} /> Add new owner
          </Button>
        </Track>
      </div>
      {open && <TxModal wide onClose={handleClose} steps={AddOwnerSteps} initialData={[initialModalData]} />}
    </Box>
  )
}
