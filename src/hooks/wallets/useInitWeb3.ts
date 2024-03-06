import { useCurrentChain } from '@/hooks/useChains'
import useWallet from '@/hooks/wallets/useWallet'
import { createWeb3, createWeb3ReadOnly, setWeb3, setWeb3ReadOnly } from '@/hooks/wallets/web3'
import { useAppSelector } from '@/store'
import { selectRpc } from '@/store/settingsSlice'
import { useEffect } from 'react'
import { getRpcUrl } from '../useClient'

export const useInitWeb3 = () => {
  const chain = useCurrentChain()
  const chainId = chain?.chainId
  const wallet = useWallet()
  const customRpc = useAppSelector(selectRpc)
  const customRpcUrl = chain ? customRpc?.[chain.chainId] : undefined

  useEffect(() => {
    if (wallet && wallet.chainId === chainId) {
      const web3 = createWeb3(wallet.provider)
      setWeb3(web3)
    } else {
      setWeb3(undefined)
    }
  }, [wallet, chainId])

  useEffect(() => {
    if (!chain) {
      setWeb3ReadOnly(undefined)
      return
    }

    const web3ReadOnly = createWeb3ReadOnly(chain, getRpcUrl(Number(chainId || 1)) || customRpcUrl)
    setWeb3ReadOnly(web3ReadOnly)
  }, [chain, customRpcUrl, chainId])
}
