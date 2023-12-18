import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@mui/material'
import AddIcon from '@mui/icons-material/Add'
import { SafeAppsTag } from '@/config/constants'
import { AppRoutes } from '@/config/routes'
import { useRemoteSafeApps } from '@/hooks/safe-apps/useRemoteSafeApps'
import madProps from '@/utils/mad-props'
import { useMemo } from 'react'
import Track from '../Track'
import { OVERVIEW_EVENTS } from '@/services/analytics'

const useOnrampAppUrl = (): string | undefined => {
  const [onrampApps] = useRemoteSafeApps(SafeAppsTag.ONRAMP)
  return onrampApps?.[0]?.url
}

const buttonStyles = {
  minHeight: '40px',
}

const _BuyCryptoButton = ({
  appUrl,
  query,
}: {
  appUrl: string | undefined
  query: ReturnType<typeof useSearchParams>
}) => {
  if (!appUrl) return null

  const safe = query.get('safe')

  const linkHref = useMemo(() => {
    if (!safe) return ''
    return { pathname: AppRoutes.apps.open, query: { safe, appUrl } }
  }, [safe, appUrl])

  return (
    <Track {...OVERVIEW_EVENTS.BUY_CRYPTO_BUTTON}>
      <Link href={linkHref} passHref>
        <Button variant="contained" size="small" sx={buttonStyles} fullWidth startIcon={<AddIcon />}>
          Buy crypto
        </Button>
      </Link>
    </Track>
  )
}

const BuyCryproButton = madProps(_BuyCryptoButton, {
  appUrl: useOnrampAppUrl,
  query: useSearchParams,
})

export default BuyCryproButton
