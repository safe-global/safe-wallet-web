import type { ReactElement, SyntheticEvent } from 'react'
import { Box, Grid, Typography, Link } from '@mui/material'
import type { SafeAppData } from '@safe-global/safe-gateway-typescript-sdk'
import { Card, WidgetBody, WidgetContainer } from '../styled'
import { useRouter } from 'next/router'
import NextLink from 'next/link'
import { AppRoutes } from '@/config/routes'
import { SafeAppsTag } from '@/config/constants'
import { useRemoteSafeApps } from '@/hooks/safe-apps/useRemoteSafeApps'
import SafeAppIconCard from '@/components/safe-apps/SafeAppIconCard'
import { isWalletConnectSafeApp } from '@/utils/gateway'
import { openWalletConnect } from '@/features/walletconnect/components'
import { useHasFeature } from '@/hooks/useChains'
import { FEATURES } from '@/utils/chains'

const FeaturedAppCard = ({ app }: { app: SafeAppData }) => (
  <Card>
    <Grid container alignItems="center" spacing={3}>
      <Grid item xs={12} md={3}>
        <SafeAppIconCard src={app.iconUrl} alt={app.name} width={64} height={64} />
      </Grid>

      <Grid item xs={12} md={9}>
        <Box mb={1.01}>
          <Typography fontSize="lg">{app.description}</Typography>
        </Box>

        <Link color="primary.main" fontWeight="bold" component="span">
          Use {app.name}
        </Link>
      </Grid>
    </Grid>
  </Card>
)

const onWcWidgetClick = (e: SyntheticEvent) => {
  e.preventDefault()
  openWalletConnect()
}

export const FeaturedApps = ({ stackedLayout }: { stackedLayout: boolean }): ReactElement | null => {
  const router = useRouter()
  const [featuredApps, _, remoteSafeAppsLoading] = useRemoteSafeApps(SafeAppsTag.DASHBOARD_FEATURED)
  const enableWc = useHasFeature(FEATURES.NATIVE_WALLETCONNECT)

  if (!featuredApps?.length && !remoteSafeAppsLoading) return null

  return (
    <Grid item xs={12} md style={{ height: '100%' }}>
      <WidgetContainer id="featured-safe-apps">
        <Typography component="h2" variant="subtitle1" fontWeight={700} mb={2}>
          Connect &amp; transact
        </Typography>
        <WidgetBody>
          <Grid container spacing={3} height={1}>
            {featuredApps?.map((app) => (
              <Grid item xs={12} md={stackedLayout ? 12 : 6} key={app.id}>
                <NextLink
                  passHref
                  href={{ pathname: AppRoutes.apps.open, query: { ...router.query, appUrl: app.url } }}
                  onClick={enableWc && isWalletConnectSafeApp(app.url) ? onWcWidgetClick : undefined}
                >
                  <FeaturedAppCard app={app} />
                </NextLink>
              </Grid>
            ))}
          </Grid>
        </WidgetBody>
      </WidgetContainer>
    </Grid>
  )
}
