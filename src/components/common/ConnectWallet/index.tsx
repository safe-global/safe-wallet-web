import type { ReactElement } from 'react'
import useWallet from '@/hooks/wallets/useWallet'
import AccountCenter from '@/components/common/ConnectWallet/AccountCenter'
import ConnectWalletButton from './ConnectWalletButton'
import css from './styles.module.css'

const ConnectWallet = (): ReactElement => {
  const wallet = useWallet()

  return <div className={css.container}>{wallet ? <AccountCenter wallet={wallet} /> : <ConnectWalletButton />}</div>
}

export default ConnectWallet
