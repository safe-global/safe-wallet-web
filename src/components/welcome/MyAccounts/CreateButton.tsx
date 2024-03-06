import { AppRoutes } from '@/config/routes'
import { OVERVIEW_EVENTS, OVERVIEW_LABELS, trackEvent } from '@/services/analytics'
import { Button } from '@mui/material'
import Link from 'next/link'
import { useRouter } from 'next/router'

const buttonSx = { width: ['100%', 'auto'] }

const CreateButton = () => {
  const router = useRouter()
  const trackingLabel =
    router.pathname === AppRoutes.welcome.accounts ? OVERVIEW_LABELS.login_page : OVERVIEW_LABELS.sidebar

  const onClick = () => {
    trackEvent({ ...OVERVIEW_EVENTS.CREATE_NEW_SAFE, label: trackingLabel })
  }
  return (
    <Link href={AppRoutes.newSafe.create} passHref legacyBehavior>
      <Button
        data-sid="46607"
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
}

export default CreateButton
