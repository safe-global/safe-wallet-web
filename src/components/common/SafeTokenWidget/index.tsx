import { SafeAppsTag, SAFE_TOKEN_ADDRESSES } from '@/config/constants'
import { AppRoutes } from '@/config/routes'
import { useRemoteSafeApps } from '@/hooks/safe-apps/useRemoteSafeApps'
import useChainId from '@/hooks/useChainId'
import useSafeTokenAllocation, { useSafeTokenBalance, type Vesting } from '@/hooks/useSafeTokenAllocation'
import { OVERVIEW_EVENTS } from '@/services/analytics'
import { formatVisualAmount } from '@/utils/formatters'
import { Box, Button, ButtonBase, Skeleton, Tooltip, Typography } from '@mui/material'
import { BigNumber } from 'ethers'
import Link from 'next/link'
import { useRouter } from 'next/router'
import type { UrlObject } from 'url'
import Track from '../Track'
import SafeTokenIcon from '@/public/images/common/safe-token.svg'
import css from './styles.module.css'
import UnreadBadge from '../UnreadBadge'

const TOKEN_DECIMALS = 18

export const getSafeTokenAddress = (chainId: string): string => {
  return SAFE_TOKEN_ADDRESSES[chainId]
}

const canRedeemSep5Airdrop = (allocation?: Vesting[]): boolean => {
  const sep5Allocation = allocation?.find(({ tag }) => tag === 'user_v2')

  if (!sep5Allocation) {
    return false
  }

  return !sep5Allocation.isRedeemed
}

const SafeTokenWidget = () => {
  const chainId = useChainId()
  const router = useRouter()
  const [apps] = useRemoteSafeApps(SafeAppsTag.SAFE_GOVERNANCE_APP)
  const governanceApp = apps?.[0]

  const [allocationData, , allocationDataLoading] = useSafeTokenAllocation()
  const [allocation, , allocationLoading] = useSafeTokenBalance(allocationData)

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

  const canRedeemSep5 = canRedeemSep5Airdrop(allocationData)
  const flooredSafeBalance = formatVisualAmount(allocation || BigNumber.from(0), TOKEN_DECIMALS, 2)

  return (
    <Box className={css.buttonContainer}>
      <Tooltip title={url ? `Open ${governanceApp?.name}` : ''}>
        <span>
          <Track {...OVERVIEW_EVENTS.SAFE_TOKEN_WIDGET}>
            <Link href={url || ''} passHref legacyBehavior>
              <ButtonBase
                aria-describedby="safe-token-widget"
                sx={canRedeemSep5 ? { height: '42px !important' } : undefined}
                className={css.tokenButton}
                disabled={url === undefined}
              >
                <SafeTokenIcon width={24} height={24} />
                <Typography
                  component="div"
                  lineHeight="16px"
                  fontWeight={700}
                  // Badge does not accept className so must be here
                  className={css.allocationBadge}
                >
                  <UnreadBadge
                    invisible={!canRedeemSep5}
                    anchorOrigin={{
                      vertical: 'bottom',
                      horizontal: 'right',
                    }}
                  >
                    {allocationDataLoading || allocationLoading ? (
                      <Skeleton width="16px" animation="wave" />
                    ) : (
                      flooredSafeBalance
                    )}
                  </UnreadBadge>
                </Typography>
                {canRedeemSep5 && (
                  <Button variant="contained" className={css.redeemButton}>
                    New allocation
                  </Button>
                )}
              </ButtonBase>
            </Link>
          </Track>
        </span>
      </Tooltip>
    </Box>
  )
}

export default SafeTokenWidget
