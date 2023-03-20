import { WidgetBody, WidgetContainer } from '@/components/dashboard/styled'
import { Box, Card, Divider, Grid, Link, Skeleton, SvgIcon, Typography } from '@mui/material'
import RelayerIcon from '@/public/images/common/relayer.svg'
import css from './styles.module.css'
import useRemainingRelays from '@/hooks/useRemainingRelays'
import useChains, { useCurrentChain } from '@/hooks/useChains'
import { FEATURES, hasFeature } from '@/utils/chains'
import ImageFallback from '@/components/common/ImageFallback'

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

const Relaying = () => {
  const [remainingRelays] = useRemainingRelays()
  const { configs } = useChains()
  const currentChain = useCurrentChain()

  return (
    <WidgetContainer>
      <Typography component="h2" variant="subtitle1" fontWeight={700} mb={2}>
        Gasless transactions
      </Typography>

      <WidgetBody>
        <Card sx={{ padding: 3, height: 'inherit' }}>
          <Grid container mb={3}>
            <Grid item xs={12} sm={2}>
              <SvgIcon component={RelayerIcon} sx={{ width: 'auto', height: '60px' }} inheritViewBox />
            </Grid>
            <Grid item xs={10}>
              <Box display="flex" alignItems="center">
                <Typography variant="h6" fontWeight={700}>
                  Introducing Relayer
                </Typography>
                <Box className={css.inlineChip} sx={{ backgroundColor: 'secondary.light' }}>
                  New
                </Box>
              </Box>
              <Typography variant="body2" sx={{ display: 'inline' }}>
                Benefit from gasless experience powered by Gelato and Safe.{' '}
              </Typography>
              <Link href="#" color="primary.main" fontWeight="bold">
                Read about trial
              </Link>
            </Grid>
          </Grid>
          <Divider />
          <Grid container mt={2} spacing={3}>
            {currentChain && hasFeature(currentChain, FEATURES.RELAYING) && (
              <Grid item xs={12} sm={4}>
                <Typography variant="body1" color="primary.light">
                  Free transactions{' '}
                </Typography>
                {remainingRelays !== undefined ? (
                  <Typography fontWeight={700}>{remainingRelays} out of 5 remaining</Typography>
                ) : (
                  <Skeleton className={css.chipSkeleton} variant="rounded" />
                )}
              </Grid>
            )}
            <Grid item xs={12} sm={8}>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Typography variant="body1" color="primary.light">
                  Supported on{' '}
                </Typography>
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
                    <Typography key={chain.chainId}>{chain.chainName}</Typography>
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
