import { useEffect } from 'react'

import { useCurrentChain } from '@/hooks/useChains'
import useWallet from '@/hooks/wallets/useWallet'
import { createWeb3, createWeb3ReadOnly, setWeb3, setWeb3ReadOnly } from '@/hooks/wallets/web3'
import { useAppSelector } from '@/store'
import { selectSettings } from '@/store/settingsSlice'

export const useInitWeb3 = () => {
  const chain = useCurrentChain()
  const wallet = useWallet()
  const settings = useAppSelector(selectSettings)

  useEffect(() => {
    if (!chain || !wallet || chain.chainId !== wallet.chainId) {
      return
    }
    const web3 = createWeb3(wallet.provider)
    setWeb3(web3)
  }, [chain, wallet])

  useEffect(() => {
    if (!chain) {
      return
    }
    const web3ReadOnly = createWeb3ReadOnly(chain.rpcUri, settings.env.rpc[chain.chainId])
    setWeb3ReadOnly(web3ReadOnly)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chain?.chainId, settings.env.rpc])
}
