import type { ReactElement } from 'react'
import useWallet from '@/hooks/wallets/useWallet'
import AccountCenter from '@/components/common/ConnectWallet/AccountCenter'
import ConnectWalletButton from './ConnectWalletButton'

const ConnectWallet = (): ReactElement => {
  const wallet = useWallet()

  return wallet ? <AccountCenter wallet={wallet} /> : <ConnectWalletButton />
}

export default ConnectWallet
