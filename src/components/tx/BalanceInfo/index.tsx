import { Box, Stack, SvgIcon, Typography } from '@mui/material'
import GasStationIcon from '@/public/images/common/gas-station.svg'
import css from './styles.module.css'
import useWalletBalance from '@/hooks/wallets/useWalletBalance'
import WalletBalance from '@/components/common/WalletBalance'

const BalanceInfo = () => {
  const [balance] = useWalletBalance()

  return (
    <Box className={css.sponsoredBy}>
      <SvgIcon component={GasStationIcon} inheritViewBox className={css.icon} />
      <div>
        <Stack direction="row" spacing={0.5} alignItems="center">
          <Typography variant="body2" fontWeight={700} letterSpacing="0.1px">
            Wallet balance
          </Typography>
        </Stack>

        <Typography variant="body2" color="primary.light">
          <WalletBalance balance={balance} />
        </Typography>
      </div>
    </Box>
  )
}

export default BalanceInfo
