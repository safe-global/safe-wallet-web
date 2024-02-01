import { type ReactElement } from 'react'
import { Typography, Button, SvgIcon } from '@mui/material'
import GhostIcon from '@/public/images/transactions/ghost.svg'
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
      <Button
        sx={{
          gap: 1,
          height: '38px',
          minWidth: '186px',
        }}
        onClick={onClick}
        data-testid="toggle-untrusted"
        variant="outlined"
        size="small"
      >
        <>
          <SvgIcon component={GhostIcon} fontSize="small" inheritViewBox />
          <Typography fontSize="medium">{onlyTrusted ? 'Show' : 'Hide'} unknown</Typography>
        </>
      </Button>
    </Track>
  )
}

export default _TrustedToggleButton
