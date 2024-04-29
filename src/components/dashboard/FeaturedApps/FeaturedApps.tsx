import type { ReactElement, SyntheticEvent } from 'react'
import { Box, Grid, Typography, Link } from '@mui/material'
import { Card, WidgetBody, WidgetContainer } from '../styled'
import NextLink from 'next/link'
import SafeAppIconCard from '@/components/safe-apps/SafeAppIconCard'
import { openWalletConnect } from '@/features/walletconnect/components'
import { useHasFeature } from '@/hooks/useChains'
import { FEATURES } from '@/utils/chains'
import { useTxBuilderApp } from '@/hooks/safe-apps/useTxBuilderApp'

const FeaturedAppCard = ({ name, description, iconUrl }: { name: string; description: string; iconUrl: string }) => (
  <Card>
    <Grid container alignItems="center" spacing={3}>
      <Grid item xs={12} md={3}>
        <SafeAppIconCard src={iconUrl} alt={name} width={64} height={64} />
      </Grid>

      <Grid item xs={12} md={9}>
        <Box mb={1.01}>
          <Typography fontSize="lg">{description}</Typography>
        </Box>

        <Link color="primary.main" fontWeight="bold" component="span">
          Use {name}
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
  const txBuilder = useTxBuilderApp()
  const isWcEnabled = useHasFeature(FEATURES.NATIVE_WALLETCONNECT)

  return (
    <Grid item xs={12} md style={{ height: '100%' }}>
      <WidgetContainer id="featured-safe-apps">
        <Typography component="h2" variant="subtitle1" fontWeight={700} mb={2}>
          Connect &amp; transact
        </Typography>
        <WidgetBody>
          <Grid container spacing={3} height={1}>
            {txBuilder?.app && (
              <Grid item xs={12} md={stackedLayout ? 12 : 6}>
                <NextLink passHref href={txBuilder?.link}>
                  <FeaturedAppCard
                    name={txBuilder.app.name}
                    description={txBuilder.app.description}
                    iconUrl={txBuilder.app.iconUrl}
                  />
                </NextLink>
              </Grid>
            )}
            {isWcEnabled && (
              <Grid item xs={12} md={stackedLayout ? 12 : 6}>
                <a onClick={onWcWidgetClick} href="#">
                  <FeaturedAppCard
                    name="WalletConnect"
                    description="Connect your Safe to any dApp that supports WalletConnect"
                    iconUrl="/images/common/walletconnect.svg"
                  />
                </a>
              </Grid>
            )}
          </Grid>
        </WidgetBody>
      </WidgetContainer>
    </Grid>
  )
}
