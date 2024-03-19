import type { WCLoadingState } from '@/features/walletconnect/components/WalletConnectProvider'
import { createContext, type Dispatch, type SetStateAction } from 'react'
import type WalletConnectWallet from '@/features/walletconnect/services/WalletConnectWallet'

type WalletConnectContextType = {
  walletConnect: WalletConnectWallet | null
  error: Error | null
  setError: Dispatch<SetStateAction<Error | null>>
  open: boolean
  setOpen: (open: boolean) => void
  isLoading: WCLoadingState | undefined
  setIsLoading: Dispatch<SetStateAction<WCLoadingState | undefined>>
}

export const WalletConnectContext = createContext<WalletConnectContextType>({
  walletConnect: null,
  error: null,
  setError: () => {},
  open: false,
  setOpen: (_open: boolean) => {},
  isLoading: undefined,
  setIsLoading: () => {},
})
