import { cgwDebugStorage } from '@/components/sidebar/DebugToggle'
import { IS_PRODUCTION, SAFE_TOKEN_ADDRESSES } from '@/config/constants'
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
import Track from '../Track'

import SafeTokenIcon from './safe_token.svg'

import css from './styles.module.css'

const isStaging = !IS_PRODUCTION && !cgwDebugStorage.get()
const CLAIMING_APP_ID = isStaging ? 61 : 95

export const getSafeTokenAddress = (chainId: string): string => {
  return SAFE_TOKEN_ADDRESSES[chainId]
}

const SafeTokenWidget = () => {
  const balances = useBalances()
  const chainId = useChainId()
  const router = useRouter()
  const apps = useSafeApps()

  const claimingApp = useMemo(
    () => apps.allSafeApps.find((appData) => appData.id === CLAIMING_APP_ID),
    [apps.allSafeApps],
  )

  const tokenAddress = getSafeTokenAddress(chainId)
  if (!tokenAddress) {
    return null
  }

  const appUrl = encodeURIComponent(claimingApp?.url || '')
  const url = claimingApp ? `${AppRoutes.apps}?safe=${router.query.safe}&appUrl=${appUrl}` : undefined

  const safeBalance = balances.balances.items.find((balanceItem) => balanceItem.tokenInfo.address === tokenAddress)

  const safeBalanceDecimals = Number(safeFormatUnits(safeBalance?.balance || 0, safeBalance?.tokenInfo.decimals))
  const flooredSafeBalance = formatAmountWithPrecision(safeBalanceDecimals, 2)

  return (
    <Box className={css.buttonContainer}>
      <Tooltip title={url ? `Open ${claimingApp?.name}` : ''}>
        <span>
          <Track {...OVERVIEW_EVENTS.SAFE_TOKEN_WIDGET}>
            <Link href={url || '#'} passHref>
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
