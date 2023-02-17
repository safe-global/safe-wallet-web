import { SafeAppsTag, SAFE_TOKEN_ADDRESSES } from '@/config/constants'
import { AppRoutes } from '@/config/routes'
import { useRemoteSafeApps } from '@/hooks/safe-apps/useRemoteSafeApps'
import useChainId from '@/hooks/useChainId'
import useSafeTokenAllocation from '@/hooks/useSafeTokenAllocation'
import { OVERVIEW_EVENTS } from '@/services/analytics'
import { formatVisualAmount } from '@/utils/formatters'
import { Box, ButtonBase, Skeleton, Tooltip, Typography } from '@mui/material'
import { BigNumber } from 'ethers'
import Link from 'next/link'
import { useRouter } from 'next/router'
import type { UrlObject } from 'url'
import Track from '../Track'
import SafeTokenIcon from './safe_token.svg'
import css from './styles.module.css'

const TOKEN_DECIMALS = 18

export const getSafeTokenAddress = (chainId: string): string => {
  return SAFE_TOKEN_ADDRESSES[chainId]
}

const SafeTokenWidget = () => {
  const chainId = useChainId()
  const router = useRouter()
  const [apps] = useRemoteSafeApps(SafeAppsTag.SAFE_GOVERNANCE_APP)
  const governanceApp = apps?.[0]

  const [allocation, allocationLoading] = useSafeTokenAllocation()

  const tokenAddress = getSafeTokenAddress(chainId)
  if (!tokenAddress) {
    return null
  }

  const url: UrlObject | undefined = governanceApp
    ? {
        pathname: AppRoutes.apps.open,
        query: { safe: router.query.safe, appUrl: governanceApp.url },
      }
    : undefined

  const flooredSafeBalance = formatVisualAmount(allocation || BigNumber.from(0), TOKEN_DECIMALS, 2)

  return (
    <Box className={css.buttonContainer}>
      <Tooltip title={url ? `Open ${governanceApp?.name}` : ''}>
        <span>
          <Track {...OVERVIEW_EVENTS.SAFE_TOKEN_WIDGET}>
            <Link href={url || ''} passHref>
              <ButtonBase
                aria-describedby="safe-token-widget"
                sx={{ alignSelf: 'stretch' }}
                className={css.tokenButton}
                disabled={url === undefined}
              >
                <SafeTokenIcon />
                <Typography component="div" lineHeight="16px" fontWeight={700}>
                  {allocationLoading ? <Skeleton width="16px" animation="wave" /> : flooredSafeBalance}
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
