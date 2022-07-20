import { ReactElement, useMemo } from 'react'
import styled from '@emotion/styled'
import { Box, Grid, Typography } from '@mui/material'
import { useSafeApps } from '@/hooks/useSafeApps'
import { Card, WidgetBody, WidgetContainer, WidgetTitle } from '../styled'
import { SAFE_REACT_URL } from '@/config/constants'

export const FEATURED_APPS_TAG = 'dashboard-widgets'

const StyledImage = styled.img`
  width: 64px;
  height: 64px;
`

const StyledLink = styled.a`
  text-decoration: none;
`

const StyledGrid = styled(Grid)`
  gap: 24px;
`

const StyledGridItem = styled(Grid)`
  min-width: 300px;
`

const getSafeAppUrl = (appUrl: string) => {
  return `${SAFE_REACT_URL}/share/safe-app?appUrl=${appUrl}`
}

export const FeaturedApps = (): ReactElement | null => {
  const [allApps = [], , isLoading] = useSafeApps()
  const featuredApps = useMemo(() => allApps.filter((app) => app.tags?.includes(FEATURED_APPS_TAG)), [allApps])

  if (!featuredApps.length && !isLoading) return null

  return (
    <Grid item xs={12} md>
      <WidgetContainer id="featured-safe-apps">
        <WidgetTitle>Connect &amp; transact</WidgetTitle>
        <WidgetBody>
          <StyledGrid container>
            {featuredApps.map((app) => (
              <StyledGridItem item xs md key={app.id}>
                <StyledLink href={getSafeAppUrl(app.url)} target="_blank">
                  <Card>
                    <Grid container alignItems="center" spacing={3}>
                      <Grid item xs={12} md={3}>
                        <StyledImage src={app.iconUrl} alt={app.name} />
                      </Grid>

                      <Grid item xs={12} md={9}>
                        <Box mb={1.01}>
                          <Typography fontSize="lg">{app.description}</Typography>
                        </Box>

                        <Typography color="primary.main" fontWeight="bold">
                          Use {app.name}
                        </Typography>
                      </Grid>
                    </Grid>
                  </Card>
                </StyledLink>
              </StyledGridItem>
            ))}
          </StyledGrid>
        </WidgetBody>
      </WidgetContainer>
    </Grid>
  )
}
