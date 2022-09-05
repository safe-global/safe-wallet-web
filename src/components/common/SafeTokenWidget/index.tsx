import { SAFE_TOKEN_ADDRESSES } from '@/config/constants'
import { AppRoutes } from '@/config/routes'
import useBalances from '@/hooks/useBalances'
import useChainId from '@/hooks/useChainId'
import { formatAmountWithPrecision } from '@/utils/formatNumber'
import { safeFormatUnits } from '@/utils/formatters'
import { Box, ButtonBase, Skeleton, Typography } from '@mui/material'
import Link from 'next/link'
import { useRouter } from 'next/router'

import SafeTokenIcon from './safe_token.svg'

import css from './styles.module.css'

// TODO: once listed on safe apps list, get the url from there?
const CLAIMING_APP_URL = 'https://safe-claiming-app.pages.dev/'

export const getSafeTokenAddress = (chainId: string): string => {
  return SAFE_TOKEN_ADDRESSES[chainId]
}

const SafeTokenWidget = () => {
  const balances = useBalances()
  const chainId = useChainId()
  const router = useRouter()

  const tokenAddress = getSafeTokenAddress(chainId)
  if (!tokenAddress) {
    return null
  }

  const url = `${AppRoutes.safe.apps}?safe=${router.query.safe}&appUrl=${CLAIMING_APP_URL}`

  const safeBalance = balances.balances.items.find((balanceItem) => balanceItem.tokenInfo.address === tokenAddress)

  const safeBalanceDecimals = Number(safeFormatUnits(safeBalance?.balance || 0, safeBalance?.tokenInfo.decimals))
  const flooredSafeBalance = formatAmountWithPrecision(safeBalanceDecimals, 2)

  return (
    <Box className={css.buttonContainer}>
      <Link href={url} passHref>
        <ButtonBase aria-describedby={'safe-token-widget'} sx={{ alignSelf: 'stretch' }} className={css.tokenButton}>
          <SafeTokenIcon />
          <Typography lineHeight="16px" fontWeight={700}>
            {balances.loading ? <Skeleton variant="text" width={16} /> : flooredSafeBalance}
          </Typography>
        </ButtonBase>
      </Link>
    </Box>
  )
}

export default SafeTokenWidget
