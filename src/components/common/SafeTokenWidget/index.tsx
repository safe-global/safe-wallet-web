import { IS_PRODUCTION, SAFE_TOKEN_ADDRESSES } from '@/config/constants'
import { AppRoutes } from '@/config/routes'
import useChainId from '@/hooks/useChainId'
import useSafeTokenAllocation, { useSafeVotingPower, type Vesting } from '@/hooks/useSafeTokenAllocation'
import { OVERVIEW_EVENTS } from '@/services/analytics'
import { formatVisualAmount } from '@/utils/formatters'
import { Box, Button, ButtonBase, Skeleton, Tooltip, Typography } from '@mui/material'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import Track from '../Track'
import SafeTokenIcon from '@/public/images/common/safe-token.svg'
import css from './styles.module.css'
import UnreadBadge from '../UnreadBadge'
import classnames from 'classnames'

const TOKEN_DECIMALS = 18

export const useSafeTokenAddress = () => {
  const chainId = useChainId()
  return getSafeTokenAddress(chainId)
}

export const getSafeTokenAddress = (chainId: string): string | undefined => {
  return SAFE_TOKEN_ADDRESSES[chainId]
}

const canRedeemSep5Airdrop = (allocation?: Vesting[]): boolean => {
  const sep5Allocation = allocation?.find(({ tag }) => tag === 'user_v2')

  if (!sep5Allocation) {
    return false
  }

  return !sep5Allocation.isRedeemed && !sep5Allocation.isExpired
}

const GOVERNANCE_APP_URL = IS_PRODUCTION ? 'https://governance.safe.global' : 'https://safe-dao-governance.dev.5afe.dev'

const SafeTokenWidget = () => {
  const chainId = useChainId()
  const query = useSearchParams()

  const [allocationData, , allocationDataLoading] = useSafeTokenAllocation()
  const [allocation, , allocationLoading] = useSafeVotingPower(allocationData)

  const tokenAddress = getSafeTokenAddress(chainId)
  if (!tokenAddress) {
    return null
  }

  const url = {
    pathname: AppRoutes.apps.open,
    query: { safe: query.get('safe'), appUrl: GOVERNANCE_APP_URL },
  }

  const canRedeemSep5 = canRedeemSep5Airdrop(allocationData)
  const flooredSafeBalance = formatVisualAmount(allocation || BigInt(0), TOKEN_DECIMALS, 2)

  return (
    <Box className={css.container}>
      <Tooltip title="Go to Safe{DAO} Governance">
        <span>
          <Track {...OVERVIEW_EVENTS.SAFE_TOKEN_WIDGET}>
            <Link href={url} passHref legacyBehavior>
              <ButtonBase
                aria-describedby="safe-token-widget"
                className={classnames(css.tokenButton, { [css.sep5]: canRedeemSep5 })}
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
                  <Track {...OVERVIEW_EVENTS.SEP5_ALLOCATION_BUTTON}>
                    <Button variant="contained" className={css.redeemButton}>
                      New allocation
                    </Button>
                  </Track>
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
