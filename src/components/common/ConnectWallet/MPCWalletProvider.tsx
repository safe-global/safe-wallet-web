import { type MPCWalletHook, MPCWalletState, useMPCWallet } from '@/hooks/wallets/mpc/useMPCWallet'
import { createContext, type ReactElement } from 'react'
import { COREKIT_STATUS } from '@web3auth/mpc-core-kit'

export const MpcWalletContext = createContext<MPCWalletHook>({
  walletState: MPCWalletState.NOT_INITIALIZED,
  setWalletState: () => {},
  triggerLogin: () => Promise.resolve(COREKIT_STATUS.NOT_INITIALIZED),
  resetAccount: () => Promise.resolve(),
  upsertPasswordBackup: () => Promise.resolve(),
  recoverFactorWithPassword: () => Promise.resolve(false),
  userInfo: undefined,
  exportPk: () => Promise.resolve(undefined),
})

export const MpcWalletProvider = ({ children }: { children: ReactElement }) => {
  const mpcValue = useMPCWallet()

  return <MpcWalletContext.Provider value={mpcValue}>{children}</MpcWalletContext.Provider>
}
