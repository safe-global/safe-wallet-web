import { useMemo } from 'react'
import { Box, Skeleton, Typography } from '@mui/material'
import type { SafeBalanceResponse } from '@safe-global/safe-gateway-typescript-sdk'
import useBalances from '@/hooks/useBalances'
import FiatValue from '@/components/common/FiatValue'
import TokenAmount from '@/components/common/TokenAmount'
import TokenIcon from '@/components/common/TokenIcon'
import SwapButton from '@/features/swap/components/SwapButton'
import { AppRoutes } from '@/config/routes'
import { WidgetContainer, WidgetBody, ViewAllLink } from '../styled'
import css from '../PendingTxs/styles.module.css'
import { useRouter } from 'next/router'
import { useHasFeature } from '@/hooks/useChains'
import { FEATURES } from '@/utils/chains'

const MAX_ASSETS = 5

const AssetsDummy = () => (
  <Box className={css.container}>
    <Skeleton variant="circular" width={26} height={26} />
    {Array.from({ length: 3 }).map((_, index) => (
      <Skeleton variant="text" sx={{ flex: 1 }} key={index} />
    ))}
    <Skeleton variant="text" width={88} />
  </Box>
)

const AssetRow = ({ item, showSwap }: { item: SafeBalanceResponse['items'][number]; showSwap: boolean }) => (
  <Box className={css.container} key={item.tokenInfo.address}>
    <TokenIcon logoUri={item.tokenInfo.logoUri} tokenSymbol={item.tokenInfo.symbol} />

    <Typography flex={1}>{item.tokenInfo.name}</Typography>

    <Box flex={1}>
      <TokenAmount value={item.balance} decimals={item.tokenInfo.decimals} tokenSymbol={item.tokenInfo.symbol} />
    </Box>

    <Box flex={1}>
      <FiatValue value={item.fiatBalance} />
    </Box>

    {showSwap && (
      <Box my={-0.7}>
        <SwapButton tokenInfo={item.tokenInfo} amount="0" />
      </Box>
    )}
  </Box>
)

const AssetList = ({ items }: { items: SafeBalanceResponse['items'] }) => {
  const isSwapFeatureEnabled = useHasFeature(FEATURES.NATIVE_SWAPS)

  return (
    <Box display="flex" flexDirection="column" gap={1}>
      {items.map((item) => (
        <AssetRow item={item} key={item.tokenInfo.address} showSwap={isSwapFeatureEnabled} />
      ))}
    </Box>
  )
}

const AssetsWidget = () => {
  const router = useRouter()
  const { safe } = router.query
  const { balances, loading } = useBalances()

  const items = useMemo(() => {
    const nonZero = balances.items.filter((item) => item.balance !== '0')
    return (nonZero.length ? nonZero : balances.items).slice(0, MAX_ASSETS)
  }, [balances])

  const viewAllUrl = useMemo(
    () => ({
      pathname: AppRoutes.balances.index,
      query: { safe },
    }),
    [safe],
  )

  return (
    <WidgetContainer data-testid="assets-widget">
      <div className={css.title}>
        <Typography component="h2" variant="subtitle1" fontWeight={700} mb={2}>
          Top assets
        </Typography>

        <ViewAllLink url={viewAllUrl} text={loading ? 'View all' : `View all (${balances.items.length})`} />
      </div>

      <WidgetBody>{loading ? <AssetsDummy /> : <AssetList items={items} />}</WidgetBody>
    </WidgetContainer>
  )
}

export default AssetsWidget
