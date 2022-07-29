import { useEffect, useState } from 'react'
import { getAddress } from '@ethersproject/address'
import { type WalletState, type EIP1193Provider } from '@web3-onboard/core'
import useOnboard from './useOnboard'
import { setLastWallet } from '@/store/sessionSlice'
import { useAppDispatch } from '@/store'

export type ConnectedWallet = {
  label: string
  chainId: string
  address: string
  ens?: string
  provider: EIP1193Provider
}

// Get the most recently connected wallet address
export const getConnectedWallet = (wallets: WalletState[]): ConnectedWallet | null => {
  if (!wallets) return null

  const primaryWallet = wallets[0]
  if (!primaryWallet) return null

  const account = primaryWallet?.accounts[0]
  if (!account) return null

  return {
    label: primaryWallet.label,
    address: getAddress(account.address),
    ens: account.ens?.name,
    chainId: Number(primaryWallet.chains[0].id).toString(10),
    provider: primaryWallet.provider,
  }
}

const useWallet = (): ConnectedWallet | null => {
  const onboard = useOnboard()
  const [wallet, setWallet] = useState<ConnectedWallet | null>(null)
  const dispatch = useAppDispatch()

  useEffect(() => {
    if (!onboard) return

    const walletSubscription = onboard.state.select('wallets').subscribe((wallets) => {
      const newWallet = getConnectedWallet(onboard.state.get().wallets)
      setWallet(newWallet)
      dispatch(setLastWallet(newWallet?.label || ''))
    })

    return () => {
      walletSubscription.unsubscribe()
    }
  }, [onboard, dispatch])

  return wallet
}

export default useWallet
