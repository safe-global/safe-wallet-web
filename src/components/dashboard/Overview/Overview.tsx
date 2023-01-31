import type { ReactElement } from 'react'
import { useMemo } from 'react'
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
import { AppRoutes } from '@/config/routes'
import useSafeAddress from '@/hooks/useSafeAddress'
import useCollectibles from '@/hooks/useCollectibles'
import type { UrlObject } from 'url'
import { useVisibleBalances } from '@/hooks/useVisibleBalances'

const IdenticonContainer = styled.div`
  position: relative;
  margin-bottom: var(--space-2);
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

        <Box my={4}>
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
        <Typography color="border.main" variant="body2">
          Tokens
        </Typography>
        <StyledText fontSize="lg">
          <ValueSkeleton />
        </StyledText>
      </Grid>
      <Grid item xs={3}>
        <Typography color="border.main" variant="body2">
          NFTs
        </Typography>
        <StyledText fontSize="lg">
          <ValueSkeleton />
        </StyledText>
      </Grid>
    </Grid>
  </Card>
)

const Overview = (): ReactElement => {
  const router = useRouter()
  const safeAddress = useSafeAddress()
  const { safe, safeLoading, safeLoaded } = useSafeInfo()
  const { balances, loading: balancesLoading } = useVisibleBalances()
  const [nfts] = useCollectibles()
  const chain = useCurrentChain()
  const { chainId } = chain || {}

  const assetsLink: UrlObject = {
    pathname: AppRoutes.balances.index,
    query: { safe: router.query.safe },
  }
  const nftsLink: UrlObject = {
    pathname: AppRoutes.balances.nfts,
    query: { safe: router.query.safe },
  }

  // Native token is always returned even when its balance is 0
  const tokenCount = useMemo(() => balances.items.filter((token) => token.balance !== '0').length, [balances])
  const nftsCount = useMemo(() => (nfts ? `${nfts.next ? '>' : ''}${nfts.results.length}` : ''), [nfts])

  const isInitialState = !safeLoaded && !safeLoading

  return (
    <WidgetContainer>
      <Typography component="h2" variant="subtitle1" fontWeight={700} mb={2}>
        Overview
      </Typography>

      <WidgetBody>
        {safeLoading || isInitialState ? (
          SkeletonOverview
        ) : (
          <Card>
            <Grid container pb={2}>
              <SafeIcon address={safeAddress} threshold={safe.threshold} owners={safe.owners.length} size={48} />

              <Grid item xs />

              <Grid item>
                <ChainIndicator chainId={chainId} inline />
              </Grid>
            </Grid>

            <Box mt={2} mb={4}>
              {safeAddress ? (
                <EthHashInfo showAvatar={false} address={safeAddress} shortAddress={false} showCopyButton hasExplorer />
              ) : (
                <Skeleton />
              )}
            </Box>

            <Grid container>
              <Grid item xs={3}>
                <Link href={assetsLink} passHref>
                  <a>
                    <Typography color="border.main" variant="body2">
                      Tokens
                    </Typography>
                    <StyledText fontSize="lg">{balancesLoading ? <ValueSkeleton /> : tokenCount}</StyledText>
                  </a>
                </Link>
              </Grid>

              <Grid item xs={3}>
                <Link href={nftsLink} passHref>
                  <a>
                    <Typography color="border.main" variant="body2">
                      NFTs
                    </Typography>
                    <StyledText fontSize="lg">{nftsCount || <ValueSkeleton />}</StyledText>
                  </a>
                </Link>
              </Grid>
              <Grid item xs />

              <Grid item>
                <Box display="flex" height={1} alignItems="flex-end" justifyContent="flex-end">
                  <Link href={assetsLink} passHref>
                    <Button size="medium" variant="contained" color="primary">
                      View assets
                    </Button>
                  </Link>
                </Box>
              </Grid>
            </Grid>
          </Card>
        )}
      </WidgetBody>
    </WidgetContainer>
  )
}

export default Overview
