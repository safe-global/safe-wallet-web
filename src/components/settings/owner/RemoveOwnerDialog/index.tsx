import { IconButton, Tooltip } from '@mui/material'
import { useState } from 'react'
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline'
import TxModal from '@/components/tx/TxModal'
import useSafeInfo from '@/hooks/useSafeInfo'
import { TxStepperProps } from '@/components/tx/TxStepper/useTxStepper'
import { OwnerData } from './DialogSteps/types'
import { ReviewSelectedOwnerStep } from './DialogSteps/ReviewSelectedOwnerStep'
import { SetThresholdStep } from './DialogSteps/SetThresholdStep'
import { ReviewRemoveOwnerTxStep } from './DialogSteps/ReviewRemoveOwnerTxStep'
import Track from '@/components/common/Track'
import { SETTINGS_EVENTS } from '@/services/analytics/events/settings'

export type RemoveOwnerData = {
  removedOwner: OwnerData
  threshold: number
}

const RemoveOwnerSteps: TxStepperProps['steps'] = [
  {
    label: 'Remove owner',
    render: (data, onSubmit) => <ReviewSelectedOwnerStep data={data as RemoveOwnerData} onSubmit={onSubmit} />,
  },
  {
    label: 'Set Threshold',
    render: (data, onSubmit) => <SetThresholdStep data={data as RemoveOwnerData} onSubmit={onSubmit} />,
  },
  {
    label: 'Review Transaction',
    render: (data, onSubmit) => <ReviewRemoveOwnerTxStep data={data as RemoveOwnerData} onSubmit={onSubmit} />,
  },
]

export const RemoveOwnerDialog = ({ owner }: { owner: OwnerData }) => {
  const [open, setOpen] = useState(false)

  const { safe } = useSafeInfo()

  const handleClose = () => setOpen(false)

  const showRemoveOwnerButton = safe.owners.length > 1

  if (!showRemoveOwnerButton) {
    return null
  }

  const initialModalData: RemoveOwnerData = {
    threshold: Math.min(safe.threshold, safe.owners.length - 1),
    removedOwner: owner,
  }

  return (
    <div>
      <Track {...SETTINGS_EVENTS.SETUP.REMOVE_OWNER}>
        <Tooltip title="Remove owner">
          <IconButton onClick={() => setOpen(true)}>
            <DeleteOutlineIcon color="error" />
          </IconButton>
        </Tooltip>
      </Track>
      {open && <TxModal wide onClose={handleClose} steps={RemoveOwnerSteps} initialData={[initialModalData]} />}
    </div>
  )
}
