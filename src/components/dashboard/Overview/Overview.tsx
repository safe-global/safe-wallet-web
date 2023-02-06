import type { ReactElement } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'
import styled from '@emotion/styled'
import { Box, Button, Grid, Skeleton, Typography } from '@mui/material'
import { Card, WidgetBody, WidgetContainer } from '../styled'
import useSafeInfo from '@/hooks/useSafeInfo'
import { useCurrentChain } from '@/hooks/useChains'
import SafeIcon from '@/components/common/SafeIcon'
import ChainIndicator from '@/components/common/ChainIndicator'
import EthHashInfo from '@/components/common/EthHashInfo'
import useSafeAddress from '@/hooks/useSafeAddress'

import { AppRoutes } from '@/config/routes'

import { navItems } from '@/components/sidebar/SidebarNavigation/config'
import MainNavTabs from '@/components/common/MainNavTabs'

const IdenticonContainer = styled.div`
  position: relative;
  margin-bottom: var(--space-2);
`

const StyledCard = styled(Card)`
  padding-bottom: 0;
`

const StyledText = styled(Typography)`
  margin-top: 8px;
  font-size: 24px;
  font-weight: bold;
`

const NetworkLabelContainer = styled.div`
  position: absolute;
  top: var(--space-3);
  right: var(--space-3);

  & span {
    bottom: auto;
  }
`
  
const ValueSkeleton = () => <Skeleton variant="text" width={30} />

const SkeletonOverview = (
  <Card>
    <Grid container>
      <Grid item xs={12}>
        <IdenticonContainer>
          <Skeleton variant="circular" width="48px" height="48px" />
        </IdenticonContainer>

        <Box mb={2}>
          <Typography fontSize="lg">
            <Skeleton variant="text" height={28} />
          </Typography>
          <Skeleton variant="text" height={21} />
        </Box>
        <NetworkLabelContainer>
          <Skeleton variant="text" width="80px" />
        </NetworkLabelContainer>
      </Grid>
    </Grid>
    <Grid container>
      <Grid item xs={3}>
        <Typography color="inputDefault" fontSize="lg">
          Tokens
        </Typography>
        <StyledText fontSize="lg">
          <ValueSkeleton />
        </StyledText>
      </Grid>
      <Grid item xs={3}>
        <Typography color="inputDefault" fontSize="lg">
          NFTs
        </Typography>
        <StyledText fontSize="lg">
          <ValueSkeleton />
        </StyledText>
      </Grid>
    </Grid>
  </Card>
)
const footerPages = [AppRoutes.home, AppRoutes.balances.index, AppRoutes.addressBook, AppRoutes.apps, AppRoutes.settings.index, AppRoutes.transactions.index]

const StickyNav = (): ReactElement | null => {
  const router = useRouter()
  const safeAddress = useSafeAddress()
  const { safe, safeLoading } = useSafeInfo()
  const chain = useCurrentChain()
  const { chainId } = chain || {}

  if (!footerPages.some((path) => router.pathname.startsWith(path))) {
    return null
  }

  return (
    <WidgetContainer>
      <WidgetBody>
        {safeLoading ? (
          SkeletonOverview
        ) : (
          <StyledCard>
            <Grid container pb={2}>
              <SafeIcon address={safeAddress} threshold={safe.threshold} owners={safe.owners.length} size={48} />

            <Box mt={2} mb={4}>
              <EthHashInfo showAvatar={false} address={safeAddress} shortAddress={false} showCopyButton hasExplorer />
            </Box>
              
              <Grid item>
                <ChainIndicator chainId={chainId} inline />
              </Grid>
            </Grid>
                        <MainNavTabs tabs={navItems} />
          </StyledCard>
        )}
      </WidgetBody>
    </WidgetContainer>
  )
}

export default StickyNav
