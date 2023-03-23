import { WidgetBody, WidgetContainer } from '@/components/dashboard/styled'
import { Box, Card, Divider, Grid, Link, Skeleton, SvgIcon, Typography } from '@mui/material'
import RelayerIcon from '@/public/images/common/relayer.svg'
import css from './styles.module.css'
import useRemainingRelays from '@/hooks/useRemainingRelays'
import useChains, { useCurrentChain } from '@/hooks/useChains'
import { FEATURES, hasFeature } from '@/utils/chains'
import ImageFallback from '@/components/common/ImageFallback'
import NextLink from 'next/link'
import { AppRoutes } from '@/config/routes'
import { type UrlObject } from 'url'
import { useRouter } from 'next/router'

const FallbackChainIcon = ({ color }: { color: string }) => (
  <div
    style={{
      width: '16px',
      height: '16px',
      backgroundColor: color,
      borderRadius: '50%',
    }}
  />
)

const MAX_HOUR_RELAYS = 5

const Relaying = () => {
  const [remainingRelays, remainingRelaysError] = useRemainingRelays()
  const { configs } = useChains()
  const currentChain = useCurrentChain()
  const router = useRouter()

  const educationalSeriesLink: UrlObject = {
    pathname: AppRoutes.relayingEducation,
    query: { safe: router.query.safe },
  }

  return (
    <WidgetContainer>
      <Typography component="h2" variant="subtitle1" fontWeight={700} mb={2}>
        Gasless transactions
      </Typography>

      <WidgetBody>
        <Card sx={{ padding: 4, height: 'inherit' }}>
          <Grid container mb={3} columnSpacing={3}>
            <Grid item xs={12} sm={2}>
              <SvgIcon component={RelayerIcon} sx={{ width: 'auto', height: '100%' }} inheritViewBox />
            </Grid>
            <Grid item sm={10}>
              <Box display="flex" alignItems="center">
                <Typography variant="h6" fontWeight={700}>
                  Introducing Relayer
                </Typography>
                <Box className={css.inlineChip} color="static.main" sx={{ backgroundColor: 'secondary.light' }}>
                  New
                </Box>
              </Box>
              <Typography variant="body2" marginRight={1} sx={{ display: 'inline' }}>
                Benefit from a gasless experience powered by Gelato and Safe.
              </Typography>
              <NextLink href={educationalSeriesLink} passHref>
                <Link color="primary.main" fontWeight="bold">
                  Read about trial
                </Link>
              </NextLink>
            </Grid>
          </Grid>
          <Divider />
          <Grid container mt={2} columnSpacing={6}>
            {currentChain && hasFeature(currentChain, FEATURES.RELAYING) && (
              <Grid item xs={12} sm={5}>
                <Typography color="primary.light">Free transactions</Typography>
                {remainingRelaysError ? (
                  <Typography fontWeight={700} lineHeight="30px">
                    {MAX_HOUR_RELAYS} per hour
                  </Typography>
                ) : remainingRelays !== undefined ? (
                  <Typography fontWeight={700} lineHeight="30px">
                    {remainingRelays} out of {MAX_HOUR_RELAYS} remaining
                  </Typography>
                ) : (
                  <Skeleton className={css.chipSkeleton} variant="rounded" />
                )}
              </Grid>
            )}
            <Grid item xs={12} sm={7}>
              <Box display="flex" alignItems="flex-start">
                <Typography color="primary.light">Supported on</Typography>
                <Box className={css.inlineChip} sx={{ backgroundColor: 'border.light' }}>
                  More coming soon
                </Box>
              </Box>
              {/* Chains that have relaying feature enabled */}
              {configs
                .filter((chain) => hasFeature(chain, FEATURES.RELAYING))
                .map((chain) => (
                  <Box display="flex" alignItems="center" gap={1} key={chain.chainId}>
                    <ImageFallback
                      src={chain.nativeCurrency.logoUri}
                      about={chain.chainName}
                      fallbackSrc=""
                      fallbackComponent={<FallbackChainIcon color={chain.theme.backgroundColor} />}
                      height="16px"
                    />
                    <Typography fontWeight={700}>{chain.chainName}</Typography>
                  </Box>
                ))}
            </Grid>
          </Grid>
        </Card>
      </WidgetBody>
    </WidgetContainer>
  )
}

export default Relaying
