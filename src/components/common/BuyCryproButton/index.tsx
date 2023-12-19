import { usePathname, useSearchParams } from 'next/navigation'
import Link, { type LinkProps } from 'next/link'
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

const useBuyCryptoHref = (): LinkProps['href'] | undefined => {
  const query = useSearchParams()
  const safe = query.get('safe')
  const appUrl = useOnrampAppUrl()

  return useMemo(() => {
    if (!safe || !appUrl) return undefined
    return { pathname: AppRoutes.apps.open, query: { safe, appUrl } }
  }, [safe, appUrl])
}

const buttonStyles = {
  minHeight: '40px',
}

const _BuyCryptoButton = ({ href, pagePath }: { href?: LinkProps['href']; pagePath: string }) => {
  if (!href) return null

  return (
    <Track {...OVERVIEW_EVENTS.BUY_CRYPTO_BUTTON} label={pagePath}>
      <Link href={href} passHref>
        <Button variant="contained" size="small" sx={buttonStyles} fullWidth startIcon={<AddIcon />}>
          Buy crypto
        </Button>
      </Link>
    </Track>
  )
}

const BuyCryproButton = madProps(_BuyCryptoButton, {
  href: useBuyCryptoHref,
  pagePath: usePathname,
})

export default BuyCryproButton
