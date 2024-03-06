import WalletBalance from '@/components/common/WalletBalance'
import useWalletBalance from '@/hooks/wallets/useWalletBalance'
import { Typography } from '@mui/material'
import css from './styles.module.css'

// TODO: Remove this component if not being used
const BalanceInfo = () => {
  const [balance] = useWalletBalance()

  return (
    <div data-sid="61219" className={css.container}>
      <Typography variant="body2" color="primary.light">
        <b>Wallet balance:</b> <WalletBalance balance={balance} />
      </Typography>
    </div>
  )
}

export default BalanceInfo
