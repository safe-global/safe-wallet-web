import { useMPCWallet, MPCWalletState, type MPCWalletHook } from '@/hooks/wallets/mpc/useMPCWallet'
import { createContext, type ReactElement } from 'react'

export const MpcWalletContext = createContext<MPCWalletHook>({
  walletState: MPCWalletState.NOT_INITIALIZED,
  setWalletState: () => {},
  triggerLogin: () => Promise.resolve(false),
  resetAccount: () => Promise.resolve(),
  upsertPasswordBackup: () => Promise.resolve(),
  recoverFactorWithPassword: () => Promise.resolve(false),
  userInfo: undefined,
})

export const MpcWalletProvider = ({ children }: { children: ReactElement }) => {
  const mpcValue = useMPCWallet()

  return <MpcWalletContext.Provider value={mpcValue}>{children}</MpcWalletContext.Provider>
}
