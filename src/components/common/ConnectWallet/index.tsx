import type { ReactElement } from 'react'
import useWallet from '@/hooks/wallets/useWallet'
import AccountCenter from '@/components/common/ConnectWallet/AccountCenter'
import ConnectionCenter from '@/components/common/ConnectWallet/ConnectionCenter'

const ConnectWallet = (): ReactElement => {
  const wallet = useWallet()

  return wallet ? <AccountCenter wallet={wallet} /> : <ConnectionCenter />
}

export default ConnectWallet
