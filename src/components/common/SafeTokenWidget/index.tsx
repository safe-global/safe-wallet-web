import { SAFE_TOKEN_ADDRESSES } from '@/config/constants'
import useBalances from '@/hooks/useBalances'
import useChainId from '@/hooks/useChainId'
import { safeFormatUnits } from '@/utils/formatters'
import { Box, ButtonBase, Skeleton, Typography } from '@mui/material'

import SafeTokenIcon from './safe_token.svg'

import css from './styles.module.css'

export const getSafeTokenAddress = (chainId: string): string => {
  return SAFE_TOKEN_ADDRESSES[chainId]
}

const SafeTokenWidget = () => {
  const balances = useBalances()
  const chainId = useChainId()

  const tokenAddress = getSafeTokenAddress(chainId)
  if (!tokenAddress) {
    return null
  }

  const safeBalance = balances.balances.items.find((balanceItem) => balanceItem.tokenInfo.address === tokenAddress)

  const safeBalanceDecimals = Number(safeFormatUnits(safeBalance?.balance || 0, safeBalance?.tokenInfo.decimals))
  const flooredSafeBalance = Math.floor(safeBalanceDecimals).toFixed(0)

  return (
    <Box className={css.buttonContainer}>
      <ButtonBase
        disabled /* Until safe app is deployed! */
        aria-describedby={'safe-token-widget'}
        sx={{ alignSelf: 'stretch' }}
        className={css.tokenButton}
      >
        <SafeTokenIcon />

        <Typography lineHeight="16px" fontWeight={700}>
          {balances.loading ? <Skeleton variant="text" width={16} /> : flooredSafeBalance}
        </Typography>
      </ButtonBase>
    </Box>
  )
}

export default SafeTokenWidget
