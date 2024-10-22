import { useMemo } from 'react'
import { Typography, Card, SvgIcon, Grid, Button, Box, Stack } from '@mui/material'
import css from './styles.module.css'
import Kiln from '@/public/images/common/kiln.svg'
import StakeIllustrationLight from '@/public/images/common/stake-illustration-light.svg'
import StakeIllustrationDark from '@/public/images/common/stake-illustration-dark.svg'
import classNames from 'classnames'
import { useDarkMode } from '@/hooks/useDarkMode'
import { useRouter } from 'next/router'
import NextLink from 'next/link'
import { OVERVIEW_EVENTS, trackEvent } from '@/services/analytics'
import useLocalStorage from '@/services/local-storage/useLocalStorage'
import ExternalLink from '@/components/common/ExternalLink'
import { useSanctionedAddress } from '@/hooks/useSanctionedAddress'
import useIsStakingFeatureEnabled from '@/features/stake/hooks/useIsSwapFeatureEnabled'
import { AppRoutes } from '@/config/routes'
import useBalances from '@/hooks/useBalances'
import { formatUnits } from 'ethers'
import { TokenType } from '@safe-global/safe-gateway-typescript-sdk'

const LOCAL_STORAGE_KEY_HIDE_WIDGET = 'hideStakingBanner'
const LEARN_MORE_LINK = 'https://help.safe.global/en/articles/222615-safe-staking'
const MIN_NATIVE_TOKEN_BALANCE = 32

const StakingBanner = () => {
  const isDarkMode = useDarkMode()
  const router = useRouter()
  const { balances } = useBalances()

  const nativeTokenBalance = useMemo(
    () => balances.items.find((balance) => balance.tokenInfo.type === TokenType.NATIVE_TOKEN),
    [balances.items],
  )

  const hasSufficientFunds =
    nativeTokenBalance != null &&
    Number(formatUnits(nativeTokenBalance.balance, nativeTokenBalance.tokenInfo.decimals)) >= MIN_NATIVE_TOKEN_BALANCE

  const [widgetHidden = false, setWidgetHidden] = useLocalStorage<boolean>(LOCAL_STORAGE_KEY_HIDE_WIDGET)

  const isStakingFeatureEnabled = useIsStakingFeatureEnabled()

  const sanctionedAddress = useSanctionedAddress(isStakingFeatureEnabled && !widgetHidden)

  if (!isStakingFeatureEnabled || widgetHidden || Boolean(sanctionedAddress) || !hasSufficientFunds) return null

  const onClick = () => {
    trackEvent(OVERVIEW_EVENTS.OPEN_STAKING_WIDGET)
  }

  const onHide = () => {
    setWidgetHidden(true)
    trackEvent(OVERVIEW_EVENTS.HIDE_STAKING_BANNER)
  }

  const onLearnMore = () => {
    trackEvent(OVERVIEW_EVENTS.OPEN_LEARN_MORE_STAKING_BANNER)
  }

  return (
    <>
      <Card className={css.widgetWrapper}>
        <Box sx={{ display: { xs: 'none', sm: 'block' }, position: 'relative' }} mr={{ sm: -8, md: -4, lg: 0 }}>
          <Box className={classNames(css.gradientBackground, { [css.gradientBackgroundDarkMode]: isDarkMode })} />
          <SvgIcon
            component={isDarkMode ? StakeIllustrationLight : StakeIllustrationDark}
            inheritViewBox
            className={classNames(css.stakeIllustration)}
          />
        </Box>

        <Grid container rowSpacing={2}>
          <Grid item xs={12} zIndex={2} mb={1}>
            <Stack spacing={0.5} direction="row">
              <Typography variant="overline" color="primary.light">
                Powered by
              </Typography>
              <SvgIcon
                component={Kiln}
                inheritViewBox
                color="border"
                className={classNames(css.kilnIcon, { [css.kilnIconDarkMode]: isDarkMode })}
              />
            </Stack>
          </Grid>

          <Grid item xs={12} zIndex={2}>
            <Typography
              variant="h2"
              fontWeight={700}
              className={classNames(css.header, { [css.gradientText]: isDarkMode })}
            >
              Stake your ETH and earn rewards
            </Typography>
          </Grid>

          <Grid item xs={12} sm={6} zIndex={2} mb={1}>
            <Typography variant="body1">
              Lock 32 ETH and become a validator easily with the Kiln widget — faster and more cost-effective. You can
              also explore Safe Apps or home staking for other options. Staking involves risks like slashing.
            </Typography>
            {LEARN_MORE_LINK && (
              <ExternalLink onClick={onLearnMore} href={LEARN_MORE_LINK}>
                Learn more
              </ExternalLink>
            )}
          </Grid>

          <Grid item xs={12}>
            <Stack direction="row" spacing={2}>
              <NextLink
                href={AppRoutes.stake && { pathname: AppRoutes.stake, query: { safe: router.query.safe } }}
                passHref
                rel="noreferrer"
                onClick={onClick}
              >
                <Button fullWidth variant="contained">
                  Stake ETH
                </Button>
              </NextLink>
              <Button variant="text" onClick={onHide}>
                Don&apos;t show again
              </Button>
            </Stack>
          </Grid>
        </Grid>
      </Card>
    </>
  )
}

export default StakingBanner
