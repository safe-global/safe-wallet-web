import { Button } from '@mui/material'
import Link from 'next/link'
import { AppRoutes } from '@/config/routes'
import { CREATE_SAFE_EVENTS, OVERVIEW_EVENTS, trackEvent } from '@/services/analytics'
import Track from '@/components/common/Track'

const buttonSx = { width: ['100%', 'auto'] }

const onClick = () => {
  trackEvent(OVERVIEW_EVENTS.CREATE_NEW_SAFE)
}

const CreateButton = () => (
  <Track {...CREATE_SAFE_EVENTS.CONTINUE_TO_CREATION}>
    <Link href={AppRoutes.newSafe.create} passHref legacyBehavior>
      <Button disableElevation size="small" variant="contained" sx={buttonSx} component="a" onClick={onClick}>
        Create account
      </Button>
    </Link>
  </Track>
)

export default CreateButton
