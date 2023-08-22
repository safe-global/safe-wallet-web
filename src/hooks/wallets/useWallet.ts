import { useEffect, useState } from 'react'
import { useMPCProvider } from './mpc/useMPCWallet'
import useOnboard, { type ConnectedWallet, getConnectedWallet } from './useOnboard'

const useWallet = (): ConnectedWallet | null => {
  const onboard = useOnboard()
  const mpcWallet = useMPCProvider()
  const onboardWallets = onboard?.state.get().wallets || []
  const [wallet, setWallet] = useState<ConnectedWallet | null>(getConnectedWallet(onboardWallets))

  useEffect(() => {
    if (!onboard) return

    const walletSubscription = onboard.state.select('wallets').subscribe((wallets) => {
      const newWallet = getConnectedWallet(wallets)
      setWallet(newWallet)
    })

    return () => {
      walletSubscription.unsubscribe()
    }
  }, [onboard])

  return wallet ?? mpcWallet ?? null
}

export default useWallet
