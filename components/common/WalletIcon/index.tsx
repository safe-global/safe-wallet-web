import { WALLET_KEYS } from '@/hooks/wallets/wallets'
import useAsync from '@/hooks/useAsync'
import { Skeleton } from '@mui/material'

enum ADDITIONAL_KEYS {
  METAMASK = 'METAMASK',
}

export type ALL_WALLET_KEYS = typeof WALLET_KEYS & typeof ADDITIONAL_KEYS

const getWalletIcon = async (provider: keyof ALL_WALLET_KEYS): Promise<string> => {
  const walletKeys = {
    [ADDITIONAL_KEYS.METAMASK]: (await import('@web3-onboard/injected-wallets/dist/icons/metamask')).default,
    [WALLET_KEYS.COINBASE]: (await import('@web3-onboard/coinbase/dist/icon')).default,
    [WALLET_KEYS.INJECTED]: (await import('@web3-onboard/injected-wallets/dist/icons/metamask')).default,
    [WALLET_KEYS.KEYSTONE]: (await import('@web3-onboard/keystone/dist/icon')).default,
    [WALLET_KEYS.WALLETCONNECT]: (await import('@web3-onboard/walletconnect/dist/icon')).default,
    [WALLET_KEYS.TREZOR]: (await import('@web3-onboard/trezor/dist/icon')).default,
    [WALLET_KEYS.LEDGER]: (await import('@web3-onboard/ledger/dist/icon')).default,
    [WALLET_KEYS.FORTMATIC]: (await import('@web3-onboard/fortmatic/dist/icon')).default,
    [WALLET_KEYS.PORTIS]: (await import('@web3-onboard/portis/dist/icon')).default,
    [WALLET_KEYS.TORUS]: (await import('@web3-onboard/torus/dist/icon')).default,
  }

  return walletKeys[provider]
}

const WalletIcon = ({ provider }: { provider: string }) => {
  const [icon] = useAsync<string>(async () => {
    return getWalletIcon(provider.toUpperCase() as keyof ALL_WALLET_KEYS)
  }, [])

  return icon ? (
    <img width={30} height={30} src={`data:image/svg+xml;utf8,${encodeURIComponent(icon)}`} alt={`${provider} logo`} />
  ) : (
    <Skeleton variant="circular" width={30} height={30} />
  )
}

export default WalletIcon
