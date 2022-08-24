import { type ReactElement } from 'react'
import css from './styles.module.css'
import useBalances from '@/hooks/useBalances'
import useSafeAddress from '@/hooks/useSafeAddress'
import { safeFormatAmount } from '@/utils/formatters'
import { Box, Typography } from '@mui/material'
import EthHashInfo from '@/components/common/EthHashInfo'

const SendFromBlock = (): ReactElement => {
  const address = useSafeAddress()
  const { balances } = useBalances()
  const nativeToken = balances.items.find((item) => parseInt(item.tokenInfo.address, 16) === 0)
  const nativeTokenBalance = nativeToken ? safeFormatAmount(nativeToken.balance, nativeToken.tokenInfo.decimals) : '0'

  return (
    <Box sx={{ borderBottom: ({ palette }) => `1px solid ${palette.divider}` }} pb={2} mb={2}>
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
    </Box>
  )
}

export default SendFromBlock
