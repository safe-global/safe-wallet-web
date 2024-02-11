import { Button } from '@mui/material'
import Link from 'next/link'
import { AppRoutes } from '@/config/routes'
import { useCurrentChain } from '@/hooks/useChains'
import { OVERVIEW_EVENTS, trackEvent } from '@/services/analytics'
import { useMemo } from 'react'

const buttonSx = { width: ['100%', 'auto'] }

const onClick = () => {
  trackEvent(OVERVIEW_EVENTS.CREATE_NEW_SAFE)
}

const CreateButton = () => {
  const currentChain = useCurrentChain()
  const href = useMemo(
    () => ({ pathname: AppRoutes.newSafe.create, query: { chain: currentChain?.shortName } }),
    [currentChain?.shortName],
  )

  return (
    <Link href={href} passHref legacyBehavior>
      <Button disableElevation size="small" variant="contained" sx={buttonSx} component="a" onClick={onClick}>
        Create account
      </Button>
    </Link>
  )
}

export default CreateButton
