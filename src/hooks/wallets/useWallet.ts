import { useEffect, useState } from 'react'
import useOnboard, { type ConnectedWallet, getConnectedWallet } from './useOnboard'

const useWallet = (): ConnectedWallet | null => {
  const onboard = useOnboard()
  const [wallet, setWallet] = useState<ConnectedWallet | null>(null)

  useEffect(() => {
    if (!onboard) return

    const onWallet = () => {
      const onboardWallets = onboard?.state.get().wallets || []
      const currWallet = getConnectedWallet(onboardWallets)
      setWallet(currWallet)
    }

    onWallet()

    const walletSubscription = onboard.state.select('wallets').subscribe(onWallet)

    return () => {
      walletSubscription.unsubscribe()
    }
  }, [onboard])

  return wallet
}

export default useWallet
