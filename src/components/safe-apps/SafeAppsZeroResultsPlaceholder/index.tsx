import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'
import type { LinkProps } from 'next/link'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { useMemo } from 'react'

import PagePlaceholder from '@/components/common/PagePlaceholder'
import { SafeAppsTag } from '@/config/constants'
import { AppRoutes } from '@/config/routes'
import { useRemoteSafeApps } from '@/hooks/safe-apps/useRemoteSafeApps'
import AddCustomAppIcon from '@/public/images/apps/add-custom-app.svg'

const useWCAppLink = (): LinkProps['href'] => {
  const router = useRouter()
  const [matchingApps] = useRemoteSafeApps(SafeAppsTag.WALLET_CONNECT)
  const app = matchingApps?.[0]

  return useMemo(
    () => ({
      pathname: AppRoutes.apps.open,
      query: { safe: router.query.safe, appUrl: app?.url },
    }),
    [app?.url, router.query.safe],
  )
}

const SafeAppsZeroResultsPlaceholder = ({ searchQuery }: { searchQuery: string }) => {
  const wcLink = useWCAppLink()
  return (
    <PagePlaceholder
      img={<AddCustomAppIcon />}
      text={
        <Typography variant="body1" color="primary.light" m={2} maxWidth="600px">
          No Safe Apps found matching <strong>{searchQuery}</strong>. Connect to dApps that haven&apos;t yet been
          integrated with the {'Safe{Wallet}'} using the WalletConnect Safe App.
        </Typography>
      }
    >
      <Link href={wcLink} passHref legacyBehavior>
        <Button data-sid="46837" variant="contained" disableElevation size="small">
          Use WalletConnect
        </Button>
      </Link>
    </PagePlaceholder>
  )
}

export default SafeAppsZeroResultsPlaceholder
