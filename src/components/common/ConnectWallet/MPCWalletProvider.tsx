import { useMPCWallet } from '@/hooks/wallets/mpc/useMPCWallet'
import { createContext, type Dispatch, type ReactElement, type SetStateAction } from 'react'

type MPCWalletContext = {
  copyTSSShareIntoManualBackupFactorkey: () => Promise<void>
  manualBackup: string | undefined
  setManualBackup: Dispatch<SetStateAction<string | undefined>>
  loginPending: boolean
  walletAddress: string | undefined
  triggerLogin: () => Promise<void>
  resetAccount: () => Promise<void>
  user: any // TODO add type
}

export const MpcWalletContext = createContext<MPCWalletContext>({
  copyTSSShareIntoManualBackupFactorkey: () => Promise.resolve(),
  manualBackup: '',
  setManualBackup: () => {},
  loginPending: false,
  walletAddress: '',
  triggerLogin: () => Promise.resolve(),
  resetAccount: () => Promise.resolve(),
  user: {},
})

export const MpcWalletProvider = ({ children }: { children: ReactElement }) => {
  const mpcValue = useMPCWallet()

  return <MpcWalletContext.Provider value={mpcValue}>{children}</MpcWalletContext.Provider>
}
