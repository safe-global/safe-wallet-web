import type { ChangeEvent, ReactElement } from 'react'
import { Checkbox, FormControlLabel, Tooltip } from '@mui/material'
import InfoIcon from '@mui/icons-material/Info'
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

  const infoIcon = (
    <Tooltip title="If you want to sign the transaction now but manually execute it later, uncheck this box.">
      <InfoIcon fontSize="small" sx={{ verticalAlign: 'middle', marginLeft: 0.5 }} />
    </Tooltip>
  )

  return (
    <FormControlLabel
      control={<Checkbox checked={checked} onChange={handleChange} />}
      label={<>Execute transaction {infoIcon}</>}
      sx={{ mb: 1 }}
    />
  )
}

export default ExecuteToggle
