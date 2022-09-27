import { type ReactElement } from 'react'
import { Box, Typography } from '@mui/material'
import SouthIcon from '@mui/icons-material/South'
import css from './styles.module.css'
import useBalances from '@/hooks/useBalances'
import useSafeAddress from '@/hooks/useSafeAddress'
import { formatVisualAmount } from '@/utils/formatters'
import EthHashInfo from '@/components/common/EthHashInfo'

const SendFromBlock = (): ReactElement => {
  const address = useSafeAddress()
  const { balances } = useBalances()
  const nativeToken = balances.items.find((item) => parseInt(item.tokenInfo.address, 16) === 0)
  const nativeTokenBalance = nativeToken ? formatVisualAmount(nativeToken.balance, nativeToken.tokenInfo.decimals) : '0'

  return (
    <Box className={css.container} pb={2} mb={2}>
      <Typography color={({ palette }) => palette.text.secondary} pb={1}>
        Sending from
      </Typography>

      <Box>
        <EthHashInfo address={address} shortAddress={false} hasExplorer showCopyButton />
      </Box>

      {nativeToken && (
        <Box className={css.balance} bgcolor={(theme) => theme.palette.background.main}>
          Balance:{' '}
          <b>
            {nativeTokenBalance} {nativeToken.tokenInfo.symbol}
          </b>
        </Box>
      )}

      <SouthIcon className={css.arrow} />
    </Box>
  )
}

export default SendFromBlock
