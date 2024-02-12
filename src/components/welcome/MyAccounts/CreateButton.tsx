import { Button } from '@mui/material'
import Link from 'next/link'
import { AppRoutes } from '@/config/routes'
import { OVERVIEW_EVENTS, trackEvent } from '@/services/analytics'

const buttonSx = { width: ['100%', 'auto'] }

const onClick = () => {
  trackEvent(OVERVIEW_EVENTS.CREATE_NEW_SAFE)
}

const CreateButton = () => (
  <Link href={AppRoutes.newSafe.create} passHref legacyBehavior>
    <Button
      data-testid="create-safe-btn"
      disableElevation
      size="small"
      variant="contained"
      sx={buttonSx}
      component="a"
      onClick={onClick}
    >
      Create account
    </Button>
  </Link>
)

export default CreateButton
