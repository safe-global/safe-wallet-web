import { SAFE_TOKEN_ADDRESS } from '@/config/constants'
import useBalances from '@/hooks/useBalances'
import { Box, ButtonBase, Typography } from '@mui/material'
import { ethers } from 'ethers'

import SafeTokenIcon from './safe_token.svg'

import css from './styles.module.css'

const SafeTokenWidget = () => {
  const balances = useBalances()

  const safeBalance = balances.balances.items.find(
    (balanceItem) => balanceItem.tokenInfo.address === SAFE_TOKEN_ADDRESS,
  )

  const safeBalanceDecimals = Math.floor(Number(ethers.utils.formatEther(safeBalance?.balance || '0'))).toFixed(0)

  return (
    <Box className={css.buttonContainer}>
      <ButtonBase aria-describedby={'safe-token-widget'} sx={{ alignSelf: 'stretch' }} className={css.tokenButton}>
        <SafeTokenIcon />
        <Typography lineHeight="16px" fontWeight={700}>
          {safeBalanceDecimals}
        </Typography>
      </ButtonBase>
    </Box>
  )
}

export default SafeTokenWidget
