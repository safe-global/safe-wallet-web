import type { ChangeEvent, ReactElement } from 'react'
import { Checkbox, FormControlLabel, Tooltip } from '@mui/material'
import InfoIcon from '@mui/icons-material/Info'
import { trackEvent, MODALS_EVENTS } from '@/services/analytics'

const ExecuteCheckbox = ({
  checked,
  onChange,
  disabled = false,
}: {
  checked: boolean
  onChange: (checked: boolean) => void
  disabled?: boolean
}): ReactElement => {
  const handleChange = (_: ChangeEvent<HTMLInputElement>, checked: boolean) => {
    trackEvent({ ...MODALS_EVENTS.EXECUTE_TX, label: checked })
    onChange(checked)
  }

  const infoIcon = (
    <Tooltip
      title={
        disabled
          ? 'This transaction is fully signed and will be executed.'
          : 'If you want to sign the transaction now but manually execute it later, uncheck this box.'
      }
    >
      <InfoIcon fontSize="small" sx={{ verticalAlign: 'middle', marginLeft: 0.5 }} />
    </Tooltip>
  )

  return (
    <FormControlLabel
      control={<Checkbox checked={checked} onChange={handleChange} disabled={disabled} />}
      label={<>Execute transaction {infoIcon}</>}
      sx={{ mb: 1 }}
    />
  )
}

export default ExecuteCheckbox
