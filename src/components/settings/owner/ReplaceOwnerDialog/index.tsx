import { IconButton, Tooltip, SvgIcon } from '@mui/material'
import { useState } from 'react'
import { ChooseOwnerStep } from '../AddOwnerDialog/DialogSteps/ChooseOwnerStep'

import TxModal from '@/components/tx/TxModal'
import useSafeInfo from '@/hooks/useSafeInfo'
import { ReviewOwnerTxStep } from '@/components/settings/owner/AddOwnerDialog/DialogSteps/ReviewOwnerTxStep'
import type { ChangeOwnerData } from '@/components/settings/owner/AddOwnerDialog/DialogSteps/types'
import type { TxStepperProps } from '@/components/tx/TxStepper/useTxStepper'
import Track from '@/components/common/Track'
import { SETTINGS_EVENTS } from '@/services/analytics/events/settings'
import ReplaceOwnerIcon from '@/public/images/settings/setup/replace-owner.svg'
import CheckWallet from '@/components/common/CheckWallet'

const ReplaceOwnerSteps: TxStepperProps['steps'] = [
  {
    label: 'Replace owner',
    render: (data, onSubmit) => <ChooseOwnerStep data={data as ChangeOwnerData} onSubmit={onSubmit} />,
  },
  {
    label: 'Review transaction',
    render: (data, onSubmit) => <ReviewOwnerTxStep data={data as ChangeOwnerData} onSubmit={onSubmit} />,
  },
]

export const ReplaceOwnerDialog = ({ address }: { address: string }) => {
  const [open, setOpen] = useState(false)

  const handleClose = () => setOpen(false)

  const { safe } = useSafeInfo()

  const initialModalData: Partial<ChangeOwnerData> = {
    removedOwner: { address },
    threshold: safe.threshold,
  }

  return (
    <div>
      <CheckWallet>
        {(isOk) => (
          <Track {...SETTINGS_EVENTS.SETUP.REPLACE_OWNER}>
            <Tooltip title="Replace owner">
              <IconButton onClick={() => setOpen(true)} size="small" disabled={!isOk}>
                <SvgIcon component={ReplaceOwnerIcon} inheritViewBox color="border" fontSize="small" />
              </IconButton>
            </Tooltip>
          </Track>
        )}
      </CheckWallet>

      {open && <TxModal wide onClose={handleClose} steps={ReplaceOwnerSteps} initialData={[initialModalData]} />}
    </div>
  )
}
