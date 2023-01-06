import useLocalStorage from '@/services/local-storage/useLocalStorage'

const MAX_LAST_WALLETS = 5
const STORAGE_KEY = 'lastWallets'

const addLastWallet = (oldWallets: string[] | undefined, walletLabel: string) => {
  // Add the wallet to the list of last used wallets
  return (oldWallets || [])
    .filter((label) => label !== walletLabel)
    .concat(walletLabel)
    .slice(-MAX_LAST_WALLETS)
}

export const useLastWallets = (): [string[], (newWallet: string) => void] => {
  const [lastWallets, setLastWallets] = useLocalStorage<string[]>(STORAGE_KEY)

  return [
    // Last N wallets
    lastWallets || [],
    // Add a wallet to the list of last used wallets
    (newWallet: string) => setLastWallets((oldWallets) => addLastWallet(oldWallets, newWallet)),
  ]
}
