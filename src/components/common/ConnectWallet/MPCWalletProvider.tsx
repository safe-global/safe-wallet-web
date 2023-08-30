import { useMPCWallet } from '@/hooks/wallets/mpc/useMPCWallet'
import { createContext, type Dispatch, type ReactElement, type SetStateAction } from 'react'

type MPCWalletContext = {
  manualBackup: string | undefined
  setManualBackup: Dispatch<SetStateAction<string | undefined>>
  loginPending: boolean
  walletAddress: string | undefined
  triggerLogin: () => Promise<void>
  resetAccount: () => Promise<void>
  setupUserPassword: (password: string) => Promise<void>
  user: any // TODO add type
}

export const MpcWalletContext = createContext<MPCWalletContext>({
  manualBackup: '',
  setManualBackup: () => {},
  loginPending: false,
  walletAddress: '',
  triggerLogin: () => Promise.resolve(),
  resetAccount: () => Promise.resolve(),
  setupUserPassword: () => Promise.resolve(),
  user: {},
})

export const MpcWalletProvider = ({ children }: { children: ReactElement }) => {
  const mpcValue = useMPCWallet()

  return <MpcWalletContext.Provider value={mpcValue}>{children}</MpcWalletContext.Provider>
}
