import { Button } from '@mui/material'
import { useState } from 'react'
import TxModal from '@/components/tx/TxModal'
import { TxStepperProps } from '@/components/tx/TxStepper/useTxStepper'
import { SpendingLimitForm } from '@/components/settings/SpendingLimits/NewSpendingLimit/steps/SpendingLimitForm'
import { ReviewSpendingLimit } from '@/components/settings/SpendingLimits/NewSpendingLimit/steps/ReviewSpendingLimit'
import Track from '@/components/common/Track'
import { SETTINGS_EVENTS } from '@/services/analytics/events/settings'

const NewSpendingLimitSteps: TxStepperProps['steps'] = [
  {
    label: 'New spending limit',
    render: (data, onSubmit) => <SpendingLimitForm data={data as NewSpendingLimitData} onSubmit={onSubmit} />,
  },
  {
    label: 'Review spending limit',
    render: (data, onSubmit) => <ReviewSpendingLimit data={data as NewSpendingLimitData} onSubmit={onSubmit} />,
  },
]

export type NewSpendingLimitData = {
  beneficiary: string
  tokenAddress: string
  amount: string
  resetTime: string
}

export const NewSpendingLimit = () => {
  const [open, setOpen] = useState<boolean>(false)

  return (
    <>
      <Track {...SETTINGS_EVENTS.SPENDING_LIMIT.NEW_LIMIT}>
        <Button onClick={() => setOpen(true)} sx={{ marginTop: 2 }} variant="contained">
          New spending limit
        </Button>
      </Track>
      {open && <TxModal onClose={() => setOpen(false)} steps={NewSpendingLimitSteps} />}
    </>
  )
}
