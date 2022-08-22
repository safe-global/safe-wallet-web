import type { ChangeEvent, ReactElement } from 'react'
import { Checkbox, FormControlLabel } from '@mui/material'
import { trackEvent } from '@/services/analytics/analytics'
import { MODALS_EVENTS } from '@/services/analytics/events/modals'

const ExecuteToggle = ({
  checked,
  onChange,
}: {
  checked: boolean
  onChange: (checked: boolean) => void
}): ReactElement => {
  const handleChange = (_: ChangeEvent<HTMLInputElement>, checked: boolean) => {
    trackEvent({ ...MODALS_EVENTS.EXECUTE_TX, label: checked })
    onChange(checked)
  }

  return (
    <FormControlLabel
      control={<Checkbox checked={checked} onChange={handleChange} />}
      label="Execute transaction"
      sx={{ mb: 1 }}
    />
  )
}

export default ExecuteToggle
