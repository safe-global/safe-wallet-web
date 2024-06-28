import { type ReactElement } from 'react'
import { FormControlLabel, Switch } from '@mui/material'
import { TX_LIST_EVENTS } from '@/services/analytics'
import Track from '@/components/common/Track'

const _TrustedToggleButton = ({
  onlyTrusted,
  setOnlyTrusted,
  hasDefaultTokenlist,
}: {
  onlyTrusted: boolean
  setOnlyTrusted: (on: boolean) => void
  hasDefaultTokenlist: boolean
}): ReactElement | null => {
  const onClick = () => {
    setOnlyTrusted(!onlyTrusted)
  }

  if (!hasDefaultTokenlist) {
    return null
  }

  return (
    <Track {...TX_LIST_EVENTS.TOGGLE_UNTRUSTED} label={onlyTrusted ? 'show' : 'hide'}>
      <FormControlLabel
        data-testid="toggle-untrusted"
        control={<Switch checked={onlyTrusted} onChange={onClick} />}
        label={<>Hide suspicious</>}
      />
    </Track>
  )
}

export default _TrustedToggleButton
