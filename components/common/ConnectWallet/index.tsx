import { ReactElement } from 'react'
import useWallet from '@/hooks/wallets/useWallet'
import { DisconnectButton } from '@/components/common/ConnectWallet/DisconnectButton'
import { ConnectButton } from '@/components/common/ConnectWallet/ConnectButton'

const ConnectWallet = (): ReactElement => {
  const wallet = useWallet()

  console.log('WALLET ADDRESS: ', wallet?.ens)

  return wallet ? <DisconnectButton wallet={wallet} /> : <ConnectButton />
}

export default ConnectWallet
