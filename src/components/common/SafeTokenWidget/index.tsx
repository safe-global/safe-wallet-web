import { IS_PRODUCTION, SAFE_TOKEN_ADDRESSES, SAFE_LOCKING_ADDRESS } from '@/config/constants'
import { AppRoutes } from '@/config/routes'
import useChainId from '@/hooks/useChainId'
import useSafeTokenAllocation, { useSafeVotingPower } from '@/hooks/useSafeTokenAllocation'
import { OVERVIEW_EVENTS } from '@/services/analytics'
import { formatVisualAmount } from '@/utils/formatters'
import { Box, ButtonBase, Divider, Skeleton, SvgIcon, Tooltip, Typography } from '@mui/material'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import Track from '../Track'
import SafeTokenIcon from '@/public/images/common/safe-token.svg'
import SafePassStar from '@/public/images/common/safe-pass-star.svg'
import css from './styles.module.css'
import useSafeAddress from '@/hooks/useSafeAddress'
import { skipToken } from '@reduxjs/toolkit/query/react'
import { useDarkMode } from '@/hooks/useDarkMode'
import { useGetOwnGlobalCampaignRankQuery } from '@/store/safePass'
import { formatAmount } from '@/utils/formatNumber'

const TOKEN_DECIMALS = 18

export const useSafeTokenAddress = () => {
  const chainId = useChainId()
  return getSafeTokenAddress(chainId)
}

export const getSafeTokenAddress = (chainId: string): string | undefined => {
  return SAFE_TOKEN_ADDRESSES[chainId]
}

export const getSafeLockingAddress = (chainId: string): string | undefined => {
  return SAFE_LOCKING_ADDRESS[chainId]
}

const GOVERNANCE_APP_URL = IS_PRODUCTION ? 'https://community.safe.global' : 'https://safe-dao-governance.dev.5afe.dev'

const SafeTokenWidget = () => {
  const chainId = useChainId()
  const safeAddress = useSafeAddress()
  const query = useSearchParams()
  const darkMode = useDarkMode()

  const [allocationData, , allocationDataLoading] = useSafeTokenAllocation()
  const [allocation, , allocationLoading] = useSafeVotingPower(allocationData)

  const { data: ownGlobalRank, isLoading: ownGlobalRankLoading } = useGetOwnGlobalCampaignRankQuery(
    chainId !== '1' && chainId !== '11155111' ? skipToken : { chainId, safeAddress },
    { refetchOnFocus: false },
  )

  const tokenAddress = getSafeTokenAddress(chainId)
  if (!tokenAddress) {
    return null
  }

  const url = {
    pathname: AppRoutes.apps.open,
    query: { safe: query?.get('safe'), appUrl: GOVERNANCE_APP_URL },
  }

  const flooredSafeBalance = formatVisualAmount(allocation || BigInt(0), TOKEN_DECIMALS, 0)

  return (
    <Box className={css.container}>
      <Tooltip title="Go to Safe{DAO} Governance">
        <span>
          <Track {...OVERVIEW_EVENTS.SAFE_TOKEN_WIDGET}>
            <Link href={url} passHref legacyBehavior>
              <ButtonBase aria-describedby="safe-token-widget" className={css.tokenButton} disabled={url === undefined}>
                <SafeTokenIcon width={24} height={24} />
                <Typography
                  component="div"
                  variant="body2"
                  lineHeight="20px"
                  // Badge does not accept className so must be here
                  className={css.allocationBadge}
                >
                  {allocationDataLoading || allocationLoading ? (
                    <Skeleton width="16px" animation="wave" />
                  ) : (
                    flooredSafeBalance
                  )}
                </Typography>

                <Divider orientation="vertical" />
                <SvgIcon
                  component={SafePassStar}
                  width={24}
                  height={24}
                  inheritViewBox
                  color={darkMode ? 'primary' : undefined}
                />
                <Typography
                  component="div"
                  variant="body2"
                  lineHeight="20px"
                  // Badge does not accept className so must be here
                  className={css.allocationBadge}
                >
                  {ownGlobalRankLoading ? (
                    <Skeleton width="16px" animation="wave" />
                  ) : (
                    formatAmount(Math.floor(ownGlobalRank?.totalBoostedPoints ?? 0), 0)
                  )}
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
