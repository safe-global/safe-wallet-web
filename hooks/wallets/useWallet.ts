import { useEffect, useState } from 'react'
import useOnboard, { ConnectedWallet, getConnectedWallet } from './useOnboard'

const useWallet = (): ConnectedWallet | null => {
  const onboard = useOnboard()
  const [wallet, setWallet] = useState<ConnectedWallet | null>(getConnectedWallet())

  useEffect(() => {
    if (!onboard) return

    const walletSubscription = onboard.state.select('wallets').subscribe((wallets) => {
      setWallet(getConnectedWallet(wallets))
    })

    return () => {
      walletSubscription.unsubscribe()
    }
  }, [onboard])

  return wallet
}

export default useWallet
