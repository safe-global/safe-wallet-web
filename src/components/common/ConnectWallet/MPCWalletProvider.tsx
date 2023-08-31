import { MPCWalletState, useMPCWallet } from '@/hooks/wallets/mpc/useMPCWallet'
import { createContext, type ReactElement } from 'react'

type MPCWalletContext = {
  loginPending: boolean
  walletAddress: string | undefined
  triggerLogin: () => Promise<void>
  resetAccount: () => Promise<void>
  upsertPasswordBackup: (password: string) => Promise<void>
  recoverFactorWithPassword: (password: string) => Promise<void>
  walletState: MPCWalletState
  user: any // TODO add type
}

export const MpcWalletContext = createContext<MPCWalletContext>({
  loginPending: false,
  walletAddress: '',
  walletState: MPCWalletState.NOT_INITIALIZED,
  triggerLogin: () => Promise.resolve(),
  resetAccount: () => Promise.resolve(),
  upsertPasswordBackup: () => Promise.resolve(),
  recoverFactorWithPassword: () => Promise.resolve(),
  user: {},
})

export const MpcWalletProvider = ({ children }: { children: ReactElement }) => {
  const mpcValue = useMPCWallet()

  return <MpcWalletContext.Provider value={mpcValue}>{children}</MpcWalletContext.Provider>
}
