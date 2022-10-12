import { SafeAppsTag, SAFE_TOKEN_ADDRESSES } from '@/config/constants'
import { AppRoutes } from '@/config/routes'
import { useSafeApps } from '@/hooks/safe-apps/useSafeApps'
import useBalances from '@/hooks/useBalances'
import useChainId from '@/hooks/useChainId'
import { OVERVIEW_EVENTS } from '@/services/analytics'
import { formatAmountWithPrecision } from '@/utils/formatNumber'
import { safeFormatUnits } from '@/utils/formatters'
import { Box, ButtonBase, Skeleton, Tooltip, Typography } from '@mui/material'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { useMemo } from 'react'
import type { UrlObject } from 'url'
import Track from '../Track'

import SafeTokenIcon from './safe_token.svg'

import css from './styles.module.css'

export const getSafeTokenAddress = (chainId: string): string => {
  return SAFE_TOKEN_ADDRESSES[chainId]
}

const SafeTokenWidget = () => {
  const balances = useBalances()
  const chainId = useChainId()
  const router = useRouter()
  const apps = useSafeApps()

  const claimingApp = useMemo(
    () => apps.allSafeApps.find((appData) => appData.tags.includes(SafeAppsTag.SAFE_CLAIMING_APP)),
    [apps.allSafeApps],
  )

  const tokenAddress = getSafeTokenAddress(chainId)
  if (!tokenAddress) {
    return null
  }

  const url: UrlObject | undefined = claimingApp
    ? {
        pathname: AppRoutes.apps,
        query: { safe: router.query.safe, appUrl: claimingApp?.url },
      }
    : undefined

  const safeBalance = balances.balances.items.find((balanceItem) => balanceItem.tokenInfo.address === tokenAddress)

  const safeBalanceDecimals = Number(safeFormatUnits(safeBalance?.balance || 0, safeBalance?.tokenInfo.decimals))
  const flooredSafeBalance = formatAmountWithPrecision(safeBalanceDecimals, 2)

  return (
    <Box className={css.buttonContainer}>
      <Tooltip title={url ? `Open ${claimingApp?.name}` : ''}>
        <span>
          <Track {...OVERVIEW_EVENTS.SAFE_TOKEN_WIDGET}>
            <Link href={url || ''} passHref>
              <ButtonBase
                aria-describedby={'safe-token-widget'}
                sx={{ alignSelf: 'stretch' }}
                className={css.tokenButton}
                disabled={url === undefined}
              >
                <SafeTokenIcon />
                <Typography lineHeight="16px" fontWeight={700}>
                  {balances.loading ? <Skeleton variant="text" width={16} /> : flooredSafeBalance}
                </Typography>
              </ButtonBase>
            </Link>
          </Track>
        </span>
      </Tooltip>
    </Box>
  )
}

export default SafeTokenWidget
