import { getSafeTokenAddress } from '@/components/common/SafeTokenWidget'
import { SafeAppsTag } from '@/config/constants'
import { AppRoutes } from '@/config/routes'
import { useSafeApps } from '@/hooks/safe-apps/useSafeApps'
import useBalances from '@/hooks/useBalances'
import useChainId from '@/hooks/useChainId'
import { formatAmountWithPrecision } from '@/utils/formatNumber'
import { safeFormatUnits } from '@/utils/formatters'
import { Avatar, Box, ButtonBase, Card, CardHeader, IconButton, Typography } from '@mui/material'
import { useRouter } from 'next/router'
import { useMemo, useState } from 'react'
import type { UrlObject } from 'url'
import SafeTokenIcon from '@/public/images/safe_token.svg'
import Link from 'next/link'
import ModeEditOutlinedIcon from '@mui/icons-material/ModeEditOutlined'
import CheckSharpIcon from '@mui/icons-material/CheckSharp'
import css from './styles.module.css'

const ClaimTokensCard = () => {
  const balances = useBalances()
  const chainId = useChainId()
  const router = useRouter()
  const apps = useSafeApps()
  const [isHover, setIsHover] = useState(false)

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
    <Card style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', alignItems: 'center' }}>
      <Box mt={2} mb={4}>
        <Typography variant="h3">
          <strong>{flooredSafeBalance} SAFE</strong>
        </Typography>
      </Box>
      <Box mt={2} mb={4} paddingX={2} width="100%">
        <Typography>Delegating to</Typography>
        <Card variant="outlined" sx={{ borderColor: ({ palette }) => palette.border.light }}>
          <CardHeader
            avatar={<Avatar src="/images/dashboard/delegate.png" variant="circular" alt="dummy delegator" />}
            title="banteg"
            subheader="wentokyo.eth"
            action={
              <IconButton
                color={isHover ? 'primary' : undefined}
                sx={({ palette }) => ({
                  backgroundColor: palette.background.default,
                })}
                onMouseEnter={() => setIsHover(true)}
                onMouseLeave={() => setIsHover(false)}
                onClick={() => {}}
              >
                {isHover ? <ModeEditOutlinedIcon /> : <CheckSharpIcon />}
              </IconButton>
            }
          />
        </Card>
      </Box>
      <Link href={url || ''} passHref>
        <ButtonBase className={css.tokenButton} disabled={url === undefined}>
          <SafeTokenIcon />
          <Typography lineHeight="16px" fontWeight={700}>
            Claim
          </Typography>
        </ButtonBase>
      </Link>
    </Card>
  )
}

export default ClaimTokensCard
