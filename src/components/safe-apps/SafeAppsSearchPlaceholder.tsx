import React, { useMemo } from 'react'
import { Button, Typography } from '@mui/material'
import { useRouter } from 'next/router'
import Link from 'next/link'
import type { LinkProps } from 'next/link'

import PagePlaceholder from '../common/PagePlaceholder'
import AddCustomAppIcon from '@/public/images/apps/add-custom-app.svg'
import { AppRoutes } from '@/config/routes'
import { SafeAppsTag } from '@/config/constants'
import { useSafeApps } from '@/hooks/safe-apps/useSafeApps'

const useWCAppLink = (): LinkProps['href'] => {
  const router = useRouter()
  const { allSafeApps } = useSafeApps()
  const app = allSafeApps.find((app) => app.tags?.includes(SafeAppsTag.WALLET_CONNECT))

  return useMemo(
    () => ({
      pathname: AppRoutes.apps,
      query: { safe: router.query.safe, appUrl: app?.url },
    }),
    [app?.url, router.query.safe],
  )
}

const SafeAppsSearchPlaceholder = ({ searchQuery }: { searchQuery: string }) => {
  const wcLink = useWCAppLink()
  return (
    <PagePlaceholder
      img={<AddCustomAppIcon />}
      text={
        <Typography variant="body1" color="primary.light" m={2} maxWidth="600px">
          No apps found matching <strong>{searchQuery}</strong>. Connect to dApps that haven&apos;t yet been integrated
          with the Safe using the WalletConnect App.
        </Typography>
      }
    >
      <Link href={wcLink} passHref>
        <Button variant="contained" disableElevation size="small">
          Use WalletConnect
        </Button>
      </Link>
    </PagePlaceholder>
  )
}

export default SafeAppsSearchPlaceholder
