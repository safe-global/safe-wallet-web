import { useEffect, useState } from 'react'
import { getLastWalletAddress } from './useOnboard'
import useWallet from './useWallet'

const useLastWallet = (): string | null => {
  const [lastWallet, setLastWallet] = useState<string | null>(null)
  const wallet = useWallet()

  useEffect(() => {
    if (wallet) {
      setLastWallet(wallet.address)
    } else {
      setLastWallet(getLastWalletAddress())
    }
  }, [wallet])

  return lastWallet
}

export default useLastWallet
