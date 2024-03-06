import useClient from '@/hooks/useClient'
import useOnboard, { getConnectedWallet, type ConnectedWallet, initOnboard } from '@/hooks/wallets/useOnboard'
import { useAppSelector } from '@/store'
import { selectSettings } from '@/store/settingsSlice'
import { checksumAddress } from '@/utils/addresses'
import {
  useConnectId,
  useNetwork,
  useAccount as useParticleAccount,
  useParticleConnect,
  useParticleProvider,
  useParticleTheme,
  useSwitchChains,
  useWalletMetas,
} from '@particle-network/connectkit'
import type { EVMProvider } from '@particle-network/connectors'
import { useInterval } from 'ahooks'
import BigNumber from 'bignumber.js'
import { createContext, useEffect, useState, type ReactElement, type ReactNode } from 'react'
import type { Hex } from 'viem'
export const WalletContext = createContext<ConnectedWallet | null>(null)

const WalletProvider = ({ children }: { children: ReactNode }): ReactElement => {
  const onboard = useOnboard()
  const onboardWallets = onboard?.state.get().wallets || []
  const [wallet, setWallet] = useState<ConnectedWallet | null>(getConnectedWallet(onboardWallets))
  const { cacheconnect } = useParticleConnect()

  let currentAccount = useParticleAccount() || ''
  currentAccount = checksumAddress(currentAccount)

  const provider = useParticleProvider()
  const { chain } = useNetwork()
  const connectId = useConnectId()
  const walletMetas = useWalletMetas()
  const settings = useAppSelector(selectSettings)
  const setProvider = useClient((state) => state.setProvider)
  const setPublicClient = useClient((state) => state.setPublicClient)
  const publicClient = useClient((state) => state.publicClient)
  const { setTheme } = useParticleTheme()
  const { switchChain } = useSwitchChains()
  const [walletIcon, setWalletIcon] = useState<string | undefined>(undefined)

  const getBalance = async () => {
    return publicClient.getBalance({ address: currentAccount as Hex })
  }

  useInterval(() => {
    if (!currentAccount) return ''
    getBalance().then((res) => {
      const balance = new BigNumber(res.toString(10)).div(10 ** (chain?.nativeCurrency?.decimals || 18)).toFixed(6)
      setWallet({
        ...wallet,
        balance: `${balance} ${chain?.nativeCurrency?.symbol || 'ETH'}`,
      } as any)
    })
  }, 3000)

  useEffect(() => {
    if (connectId) {
      walletMetas.then((res) => {
        if (res) {
          setWalletIcon(
            res.find((item) => item.id === connectId)?.iconUrl ||
              'https://wallet.particle.network/images/wallet_icon.svg',
          )
        }
      })
    }
  }, [connectId, walletMetas])

  useEffect(() => {
    setProvider(provider as EVMProvider)
  }, [provider, setProvider])

  useEffect(() => {
    if (chain?.id) {
      setPublicClient(chain.id)
    }
  }, [chain, setPublicClient])

  useEffect(() => {
    if (currentAccount && provider) {
      setWallet({
        address: checksumAddress(currentAccount),
        balance: '',
        chainId: chain?.id?.toString() || '',
        ens: '',
        icon: walletIcon || '',
        label: 'Particle Wallet',
        provider: provider as any,
      })
    }
  }, [currentAccount, provider, wallet?.chainId, chain?.id, walletIcon])

  useEffect(() => {
    if (wallet?.chainId || chain?.id) {
      initOnboard(currentAccount, wallet?.chainId ? wallet : chain, provider, switchChain)
    }
  }, [wallet?.chainId, chain?.id, currentAccount, switchChain, provider])

  useEffect(() => {
    setTheme && setTheme(settings.theme.darkMode ? 'dark' : 'light')
  }, [settings.theme.darkMode, setTheme])

  useEffect(() => {
    cacheconnect()
  }, [])

  return <WalletContext.Provider value={wallet}>{children}</WalletContext.Provider>
}

export default WalletProvider
