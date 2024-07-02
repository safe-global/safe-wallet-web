import { Box, Button, Card, Grid, Typography } from '@mui/material'
import type { ReactElement } from 'react'
import { useCallback } from 'react'
import { WidgetBody, WidgetContainer } from '@/components/dashboard/styled'
import { Chip } from '@/components/common/Chip'

import css from './styles.module.css'
import Link from 'next/link'
import { AppRoutes } from '@/config/routes'
import { useRouter } from 'next/router'
import useLocalStorage from '@/services/local-storage/useLocalStorage'
import { SWAP_EVENTS, SWAP_LABELS } from '@/services/analytics/events/swaps'
import Track from '@/components/common/Track'
import useIsSwapFeatureEnabled from '../../hooks/useIsSwapFeatureEnabled'

const SWAPS_PROMO_WIDGET_IS_HIDDEN = 'swapsPromoWidgetIsHidden'

function SwapWidget(): ReactElement | null {
  const [isHidden = false, setIsHidden] = useLocalStorage<boolean>(SWAPS_PROMO_WIDGET_IS_HIDDEN)
  const isSwapFeatureEnabled = useIsSwapFeatureEnabled()

  const onClick = useCallback(() => {
    setIsHidden(true)
  }, [setIsHidden])

  const router = useRouter()

  if (isHidden || !isSwapFeatureEnabled) {
    return null
  }

  return (
    <WidgetContainer>
      <WidgetBody>
        <Card className={css.card}>
          <Grid container className={css.grid}>
            <Grid item xs>
              <Box className={css.wrapper} height="100%">
                <Box>
                  <Typography variant="h4" className={css.title}>
                    Introducing native swaps
                  </Typography>
                  <Chip />
                </Box>

                <Box display="flex" flexDirection="column" height="100%">
                  <Typography mt={1}>
                    Experience our native swaps, powered by CoW Protocol! Trade seamlessly and efficiently with decoded
                    transactions that are easy to understand.
                  </Typography>

                  <Box flex={1} />

                  <Box className={css.buttonContainer} mt={3}>
                    <Track {...SWAP_EVENTS.OPEN_SWAPS} label={SWAP_LABELS.promoWidget}>
                      <Link
                        href={{ pathname: AppRoutes.swap, query: { safe: router.query.safe } }}
                        passHref
                        legacyBehavior
                      >
                        <Button variant="contained">Try it now</Button>
                      </Link>
                    </Track>
                    <Button variant="text" onClick={onClick}>
                      Don&apos;t show again
                    </Button>
                  </Box>
                </Box>
              </Box>
            </Grid>

            <Grid item xs={6} className={css.imageContainer}>
              <img src="/images/common/ic-swaps.svg" alt="Swap" />
            </Grid>
          </Grid>
        </Card>
      </WidgetBody>
    </WidgetContainer>
  )
}

export default SwapWidget
