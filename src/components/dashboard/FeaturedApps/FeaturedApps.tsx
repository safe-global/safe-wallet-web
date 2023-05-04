import type { ReactElement } from 'react'
import { Box, Grid, Typography, Link } from '@mui/material'
import { Card, WidgetBody, WidgetContainer } from '../styled'
import { useRouter } from 'next/router'
import NextLink from 'next/link'
import { AppRoutes } from '@/config/routes'
import { SafeAppsTag } from '@/config/constants'
import { useRemoteSafeApps } from '@/hooks/safe-apps/useRemoteSafeApps'
import SafeAppIconCard from '@/components/safe-apps/SafeAppIconCard'

export const FeaturedApps = ({ stackedLayout }: { stackedLayout: boolean }): ReactElement | null => {
  const router = useRouter()
  const [featuredApps, _, remoteSafeAppsLoading] = useRemoteSafeApps(SafeAppsTag.DASHBOARD_FEATURED)

  if (!featuredApps?.length && !remoteSafeAppsLoading) return null

  return (
    <Grid item xs={12} md style={{ height: '100%' }}>
      <WidgetContainer id="featured-safe-apps">
        <Typography component="h2" variant="subtitle1" fontWeight={700} mb={2}>
          Connect &amp; transact
        </Typography>
        <WidgetBody>
          <Grid
            container
            flexDirection={{ xs: 'column', sm: 'row', lg: stackedLayout ? 'column' : undefined }}
            gap={3}
            height={1}
          >
            {featuredApps?.map((app) => (
              <Grid item xs md key={app.id}>
                <NextLink
                  passHref
                  href={{ pathname: AppRoutes.apps.open, query: { ...router.query, appUrl: app.url } }}
                >
                  <a>
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
                  </a>
                </NextLink>
              </Grid>
            ))}
          </Grid>
        </WidgetBody>
      </WidgetContainer>
    </Grid>
  )
}
