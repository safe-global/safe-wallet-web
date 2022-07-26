import { ReactElement } from 'react'
import useWallet from '@/hooks/wallets/useWallet'
import AccountCenter from '@/components/common/ConnectWallet/AccountCenter'
import { ConnectButton } from '@/components/common/ConnectWallet/ConnectButton'

const ConnectWallet = (): ReactElement => {
  const wallet = useWallet()

  return wallet ? <AccountCenter wallet={wallet} /> : <ConnectButton />
}

export default ConnectWallet
