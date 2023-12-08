import { useContext } from 'react'
import { type ConnectedWallet } from './useOnboard'
import { WalletContext } from '@/components/common/WalletProvider'

const useWallet = (): ConnectedWallet | null => {
  return useContext(WalletContext)
}

export default useWallet
