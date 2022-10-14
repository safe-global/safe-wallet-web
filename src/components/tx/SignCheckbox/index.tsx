import type { ChangeEvent, ReactElement } from 'react'
import { Checkbox, FormControlLabel, Tooltip } from '@mui/material'
import InfoIcon from '@mui/icons-material/Info'
import { trackEvent, MODALS_EVENTS } from '@/services/analytics'

const SignCheckbox = ({
  checked,
  onChange,
}: {
  checked: boolean
  onChange: (checked: boolean) => void
}): ReactElement => {
  const handleChange = (_: ChangeEvent<HTMLInputElement>, checked: boolean) => {
    trackEvent({ ...MODALS_EVENTS.UNCHECK_SIGN, label: checked })
    onChange(checked)
  }

  const infoIcon = (
    <Tooltip title="Create a signed transaction or a draft? A draft can be signed later. Once signed, the transaction cannot be removed or edited.">
      <InfoIcon fontSize="small" sx={{ verticalAlign: 'middle', marginLeft: 0.5 }} />
    </Tooltip>
  )

  return (
    <div>
      <FormControlLabel
        control={<Checkbox checked={checked} onChange={handleChange} />}
        label={<>Sign transaction {infoIcon}</>}
        sx={{ mb: 1 }}
      />
    </div>
  )
}

export default SignCheckbox
