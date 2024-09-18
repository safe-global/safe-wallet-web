import { useMemo } from 'react'
import css from '@/components/dashboard/PendingTxs/styles.module.css'
import { Typography } from '@mui/material'
import { ViewAllLink } from '@/components/dashboard/styled'
import { AppRoutes } from '@/config/routes'
import { useRouter } from 'next/router'
import useBalances from '@/hooks/useBalances'
import { TokenType } from '@safe-global/safe-gateway-typescript-sdk'

const useNativeTokenBalance = () => {
  const balance = useBalances()

  return useMemo(() => {
    if (!balance) {
      return undefined
    }

    return balance.balances.items.find((item) => item.tokenInfo.type === TokenType.NATIVE_TOKEN)
  }, [balance])
}

const StakingDashboardWidget = () => {
  const router = useRouter()

  const nativeTokenBalance = useNativeTokenBalance()

  const stakeUrl = useMemo(
    () => ({
      pathname: AppRoutes.stake,
      query: { safe: router.query.safe },
    }),
    [router.query.safe],
  )

  if (nativeTokenBalance?.balance && BigInt(nativeTokenBalance.balance) >= 32n * 10n ** 18n) {
    return (
      <>
        <div className={css.title}>
          <Typography component="h2" variant="subtitle1" fontWeight={700} mb={2}>
            Stake
          </Typography>

          <ViewAllLink url={stakeUrl} text="Go to staking" />
        </div>

        <Typography component="p" variant="body1" fontWeight={400} mb={2}>
          You have enough ETH to stake. Stake your ETH to earn rewards.
        </Typography>
      </>
    )
  }

  return null
}

export default StakingDashboardWidget
